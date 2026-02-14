# Windows Installation Guide

If you encounter Rust/Cargo errors when installing dependencies, follow these steps:

## Option 1: Install Rust Properly (Recommended)

1. **Download and install Rust:**
   - Go to https://rustup.rs/
   - Download and run `rustup-init.exe`
   - Follow the installation wizard
   - **Important:** Restart your terminal/PowerShell after installation

2. **Verify Rust installation:**
   ```powershell
   rustc --version
   cargo --version
   ```

3. **Install Python dependencies:**
   ```powershell
   cd medivault-backend
   pip install -r requirements.txt
   ```

## Option 2: Use Pre-built Wheels (Easier)

If you don't want to install Rust, try installing cryptography separately first:

```powershell
# Install cryptography with pre-built wheel
pip install cryptography

# Then install other dependencies
pip install -r requirements.txt
```

## Option 3: Install Dependencies One by One

If the above doesn't work, install problematic packages separately:

```powershell
# Install base packages first
pip install fastapi uvicorn pymongo motor python-dotenv web3 python-multipart pydantic pydantic-settings requests

# Try to install cryptography (may need Rust)
pip install cryptography

# Install remaining packages
pip install python-jose[cryptography] passlib[bcrypt] ipfshttpclient
```

## Option 4: Use Alternative Packages (No Rust Required)

If you continue having issues, you can modify the code to use alternatives:

- Replace `python-jose[cryptography]` with `python-jose` (uses PyJWT instead)
- The `passlib[bcrypt]` might work without Rust if bcrypt wheels are available

## Troubleshooting

### "Cargo not found" error
- Make sure Rust is installed and added to PATH
- Restart your terminal after installing Rust
- Try: `refreshenv` (if using Chocolatey) or restart your computer

### "Failed to build cryptography"
- Make sure you have Visual Studio Build Tools installed
- Or install the pre-built wheel: `pip install --only-binary :all: cryptography`

### Still having issues?
Try using a virtual environment with Python 3.11 or 3.10 (better wheel support):

```powershell
python -m venv venv
.\venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```
