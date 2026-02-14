import os
from dotenv import load_dotenv
from web3 import Web3
from typing import List, Dict, Optional
import json

load_dotenv()

class BlockchainService:
    def __init__(self):
        self.web3 = None
        self.contract = None
        self.contract_address = None
        self.account = None
        self.private_key = None
    
    async def initialize(self):
        """Initialize Web3 connection and contract"""
        # Ganache connection
        ganache_url = os.getenv("GANACHE_URL", "http://127.0.0.1:7545")
        self.web3 = Web3(Web3.HTTPProvider(ganache_url))
        
        if not self.web3.is_connected():
            raise Exception("Failed to connect to Ganache. Make sure Ganache is running.")
        
        # Get private key for service account (first Ganache account)
        # In production, use a secure key management system
        self.private_key = os.getenv("SERVICE_ACCOUNT_PRIVATE_KEY")
        accounts = self.web3.eth.accounts
        if accounts:
            self.account = accounts[0]
            # If no private key set, try to use Ganache's default (unlocked accounts)
            if not self.private_key:
                print("Warning: SERVICE_ACCOUNT_PRIVATE_KEY not set. Using unlocked account (Ganache only).")
        
        # Contract address (should be set after deployment)
        self.contract_address = os.getenv("CONTRACT_ADDRESS")
        if not self.contract_address:
            print("Warning: CONTRACT_ADDRESS not set. Contract functions will not work.")
            return
        
        # Load contract ABI
        abi_path = os.getenv("CONTRACT_ABI_PATH", "../medivault-chain/build/contracts/MediVaultAccess.json")
        try:
            with open(abi_path, 'r') as f:
                contract_data = json.load(f)
                abi = contract_data.get('abi', [])
        except FileNotFoundError:
            print(f"Warning: Contract ABI not found at {abi_path}")
            return
        
        # Initialize contract
        self.contract = self.web3.eth.contract(address=self.contract_address, abi=abi)
    
    def _get_account(self, wallet_address: Optional[str] = None):
        """Get account for transactions"""
        if wallet_address:
            return wallet_address
        if self.account:
            return self.account
        accounts = self.web3.eth.accounts
        if accounts:
            return accounts[0]
        raise Exception("No account available")
    
    async def register_user(self, wallet_address: str, role: str) -> str:
        """Register a user on the blockchain"""
        if not self.contract:
            raise Exception("Contract not initialized")
        
        # Map role string to enum value
        role_map = {
            "Admin": 1,
            "Doctor": 2,
            "Nurse": 3,
            "Student": 4,
            "Patient": 5
        }
        role_value = role_map.get(role, 0)
        if role_value == 0:
            raise ValueError(f"Invalid role: {role}")
        
        account = self._get_account()
        
        try:
            tx = self.contract.functions.registerUser(
                wallet_address,
                role_value
            ).build_transaction({
                'from': account,
                'nonce': self.web3.eth.get_transaction_count(account),
                'gas': 100000,
                'gasPrice': self.web3.eth.gas_price
            })
            
            # Sign and send transaction
            if self.private_key:
                signed_tx = self.web3.eth.account.sign_transaction(tx, private_key=self.private_key)
                tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            else:
                # For Ganache with unlocked accounts
                tx_hash = self.web3.eth.send_transaction(tx)
            
            # Wait for receipt
            receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
            return receipt.transactionHash.hex()
        except Exception as e:
            raise Exception(f"Failed to register user on blockchain: {str(e)}")
    
    async def upload_document(
        self, 
        uploader_address: str, 
        ipfs_hash: str, 
        file_name: str, 
        patient_address: str
    ) -> str:
        """Upload a document to the blockchain"""
        if not self.contract:
            raise Exception("Contract not initialized")
        
        account = self._get_account(uploader_address)
        
        try:
            tx = self.contract.functions.uploadDocument(
                ipfs_hash,
                file_name,
                patient_address
            ).build_transaction({
                'from': account,
                'nonce': self.web3.eth.get_transaction_count(account),
                'gas': 200000,
                'gasPrice': self.web3.eth.gas_price
            })
            
            if self.private_key:
                signed_tx = self.web3.eth.account.sign_transaction(tx, private_key=self.private_key)
                tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            else:
                # For Ganache with unlocked accounts
                tx_hash = self.web3.eth.send_transaction(tx)
            
            receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
            return receipt.transactionHash.hex()
        except Exception as e:
            raise Exception(f"Failed to upload document to blockchain: {str(e)}")
    
    async def get_patient_documents(self, patient_address: str) -> List[Dict]:
        """Get all documents for a patient"""
        if not self.contract:
            raise Exception("Contract not initialized")
        
        try:
            # Call the view function
            docs = self.contract.functions.getPatientDocuments(patient_address).call()
            
            # Convert to list of dicts
            # The contract returns a struct array, handle both tuple and dict formats
            result = []
            for doc in docs:
                if isinstance(doc, (list, tuple)) and len(doc) >= 6:
                    result.append({
                        "ipfsHash": doc[0],
                        "fileName": doc[1],
                        "uploader": doc[2],
                        "patientAddress": doc[3],
                        "timestamp": doc[4],
                        "isDeleted": doc[5]
                    })
                elif hasattr(doc, '__iter__'):
                    # Try to access as dict-like object
                    try:
                        result.append({
                            "ipfsHash": getattr(doc, 'ipfsHash', doc.get('ipfsHash', '') if hasattr(doc, 'get') else ''),
                            "fileName": getattr(doc, 'fileName', doc.get('fileName', '') if hasattr(doc, 'get') else ''),
                            "uploader": getattr(doc, 'uploader', doc.get('uploader', '') if hasattr(doc, 'get') else ''),
                            "patientAddress": getattr(doc, 'patientAddress', doc.get('patientAddress', '') if hasattr(doc, 'get') else ''),
                            "timestamp": getattr(doc, 'timestamp', doc.get('timestamp', 0) if hasattr(doc, 'get') else 0),
                            "isDeleted": getattr(doc, 'isDeleted', doc.get('isDeleted', False) if hasattr(doc, 'get') else False)
                        })
                    except:
                        # Fallback: try tuple unpacking
                        if len(doc) >= 6:
                            result.append({
                                "ipfsHash": doc[0],
                                "fileName": doc[1],
                                "uploader": doc[2],
                                "patientAddress": doc[3],
                                "timestamp": doc[4],
                                "isDeleted": doc[5]
                            })
            
            return result
        except Exception as e:
            raise Exception(f"Failed to get documents from blockchain: {str(e)}")
    
    async def delete_document(
        self, 
        admin_address: str, 
        patient_address: str, 
        ipfs_hash: str
    ) -> str:
        """Delete a document (Admin only)"""
        if not self.contract:
            raise Exception("Contract not initialized")
        
        # We need to find the document index first
        # For now, we'll need to get all documents and find the index
        docs = await self.get_patient_documents(patient_address)
        document_index = None
        
        for i, doc in enumerate(docs):
            if doc["ipfsHash"] == ipfs_hash:
                document_index = i
                break
        
        if document_index is None:
            raise Exception("Document not found")
        
        account = self._get_account(admin_address)
        
        try:
            tx = self.contract.functions.deleteDocument(
                patient_address,
                document_index
            ).build_transaction({
                'from': account,
                'nonce': self.web3.eth.get_transaction_count(account),
                'gas': 100000,
                'gasPrice': self.web3.eth.gas_price
            })
            
            if self.private_key:
                signed_tx = self.web3.eth.account.sign_transaction(tx, private_key=self.private_key)
                tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            else:
                # For Ganache with unlocked accounts
                tx_hash = self.web3.eth.send_transaction(tx)
            
            receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
            return receipt.transactionHash.hex()
        except Exception as e:
            raise Exception(f"Failed to delete document on blockchain: {str(e)}")
    
    async def get_user_role(self, wallet_address: str) -> str:
        """Get user role from blockchain"""
        if not self.contract:
            raise Exception("Contract not initialized")
        
        try:
            role_value = self.contract.functions.userRoles(wallet_address).call()
            role_map = {
                0: "None",
                1: "Admin",
                2: "Doctor",
                3: "Nurse",
                4: "Student",
                5: "Patient"
            }
            return role_map.get(role_value, "None")
        except Exception as e:
            raise Exception(f"Failed to get user role: {str(e)}")
