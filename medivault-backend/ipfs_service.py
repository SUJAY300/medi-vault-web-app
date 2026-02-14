import os
from dotenv import load_dotenv
import ipfshttpclient
from typing import Optional

load_dotenv()

class IPFSService:
    def __init__(self):
        self.client = None
        self.pinata_api_key = os.getenv("PINATA_API_KEY")
        self.pinata_secret_key = os.getenv("PINATA_SECRET_KEY")
        self.use_pinata = bool(self.pinata_api_key and self.pinata_secret_key)
    
    async def initialize(self):
        """Initialize IPFS client"""
        if not self.use_pinata:
            # Use local IPFS node
            ipfs_host = os.getenv("IPFS_HOST", "127.0.0.1")
            ipfs_port = int(os.getenv("IPFS_PORT", "5001"))
            try:
                self.client = ipfshttpclient.connect(f"/ip4/{ipfs_host}/tcp/{ipfs_port}/http")
            except Exception as e:
                print(f"Warning: Could not connect to local IPFS node: {e}")
                print("Falling back to Pinata or public gateway")
        else:
            print("Using Pinata for IPFS")
    
    async def upload_file(self, file_content: bytes, filename: str) -> str:
        """Upload a file to IPFS and return the hash"""
        if self.use_pinata:
            return await self._upload_to_pinata(file_content, filename)
        elif self.client:
            return await self._upload_to_local_ipfs(file_content, filename)
        else:
            raise Exception("IPFS not configured. Please set up local IPFS or Pinata credentials")
    
    async def _upload_to_pinata(self, file_content: bytes, filename: str) -> str:
        """Upload to Pinata IPFS service"""
        try:
            import requests
        except ImportError:
            raise Exception("requests library is required for Pinata. Install with: pip install requests")
        
        url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
        
        files = {
            'file': (filename, file_content)
        }
        
        headers = {
            'pinata_api_key': self.pinata_api_key,
            'pinata_secret_api_key': self.pinata_secret_key
        }
        
        response = requests.post(url, files=files, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        return result['IpfsHash']
    
    async def _upload_to_local_ipfs(self, file_content: bytes, filename: str) -> str:
        """Upload to local IPFS node"""
        import asyncio
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, lambda: self.client.add(file_content))
        if isinstance(result, list):
            return result[0]['Hash']
        return result['Hash']
    
    async def get_file(self, ipfs_hash: str) -> bytes:
        """Retrieve a file from IPFS"""
        if self.use_pinata:
            # Use Pinata gateway
            try:
                import requests
            except ImportError:
                raise Exception("requests library is required. Install with: pip install requests")
            url = f"https://gateway.pinata.cloud/ipfs/{ipfs_hash}"
            response = requests.get(url)
            response.raise_for_status()
            return response.content
        elif self.client:
            # Use local IPFS node
            import asyncio
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, lambda: self.client.cat(ipfs_hash))
            return result
        else:
            # Fallback to public gateway
            import requests
            url = f"https://ipfs.io/ipfs/{ipfs_hash}"
            response = requests.get(url)
            response.raise_for_status()
            return response.content
