# backend/routes/blockchain.py
from fastapi import APIRouter, HTTPException
import httpx
import os

router = APIRouter()

GANACHE_URL      = os.getenv("GANACHE_URL", "http://127.0.0.1:7545")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "")


async def call_ganache(method: str, params: list = []):
    """
    Make a raw JSON-RPC call to Ganache.
    No web3 library needed — just HTTP.
    """
    payload = {
        "jsonrpc": "2.0",
        "method":  method,
        "params":  params,
        "id":      1
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GANACHE_URL,
            json=payload,
            timeout=10.0
        )
    return response.json()


@router.get("/status", summary="Check blockchain connection")
async def blockchain_status():
    """Check if Ganache is running and return current block number."""
    try:
        result = await call_ganache("eth_blockNumber")

        if "error" in result:
            return {"connected": False, "error": result["error"]}

        # Convert hex block number to int
        block_number = int(result["result"], 16)

        return {
            "connected":        True,
            "network_url":      GANACHE_URL,
            "block_number":     block_number,
            "contract_address": CONTRACT_ADDRESS or "Not configured in .env"
        }

    except Exception as e:
        return {
            "connected": False,
            "error":     f"Cannot reach Ganache: {str(e)}",
            "tip":       "Make sure Ganache is running on port 7545"
        }


@router.get("/accounts", summary="Get Ganache test accounts")
async def get_accounts():
    """Return all test accounts from Ganache."""
    try:
        result = await call_ganache("eth_accounts")
        return {
            "accounts": result.get("result", []),
            "total":    len(result.get("result", []))
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Ganache not reachable: {str(e)}"
        )


@router.get("/balance/{address}", summary="Get ETH balance of an address")
async def get_balance(address: str):
    """Return ETH balance for a wallet address."""
    try:
        result = await call_ganache("eth_getBalance", [address, "latest"])

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        # Convert from wei (hex) to ETH
        wei     = int(result["result"], 16)
        eth     = wei / 10**18

        return {
            "address": address,
            "balance_wei": wei,
            "balance_eth": round(eth, 4)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Ganache not reachable: {str(e)}"
        )


@router.get("/block", summary="Get latest block info")
async def get_latest_block():
    """Return information about the latest block."""
    try:
        result = await call_ganache("eth_getBlockByNumber", ["latest", False])

        if "error" in result:
            raise HTTPException(status_code=400, detail=str(result["error"]))

        block = result.get("result", {})

        return {
            "block_number":    int(block.get("number", "0x0"), 16),
            "block_hash":      block.get("hash"),
            "timestamp":       int(block.get("timestamp", "0x0"), 16),
            "transaction_count": len(block.get("transactions", []))
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Ganache not reachable: {str(e)}"
        )


@router.get("/contract-info", summary="Get stored contract info")
async def contract_info():
    """
    Returns the contract address stored in .env.
    Actual contract interaction (verify, upload, etc.)
    is handled directly by the React frontend via MetaMask.
    """
    return {
        "contract_address": CONTRACT_ADDRESS or "Not set — add to backend/.env",
        "network":          "Ganache Local (Chain ID 1337)",
        "rpc_url":          GANACHE_URL,
        "note":             "Smart contract functions are called from React via MetaMask"
    }