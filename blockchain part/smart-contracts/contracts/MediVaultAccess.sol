// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MediVaultAccess
 * @dev Blockchain-based hospital document management with role-based access control
 */
contract MediVaultAccess {

    // ========== ENUMS ==========

    enum Role { None, Admin, Doctor, Patient, Student }
    enum DocumentStatus { Active, Revoked, Archived }

    // ========== STRUCTS ==========

    struct User {
        address walletAddress;
        string name;
        string email;
        Role role;
        bool isRegistered;
        bool isActive;
        uint256 registeredAt;
    }

    struct Document {
        string ipfsHash;
        string fileName;
        string documentType;
        address patientAddress;
        address uploadedBy;
        uint256 uploadedAt;
        DocumentStatus status;
        bool isVerified;
    }

    struct AccessRecord {
        address grantedTo;
        address grantedBy;
        uint256 grantedAt;
        uint256 expiresAt;
        bool isActive;
    }

    struct AuditLog {
        address actor;
        string action;
        string details;
        uint256 timestamp;
    }

    // ========== STATE VARIABLES ==========

    address public owner;
    uint256 public totalUsers;
    uint256 public totalDocuments;

    mapping(address => User) public users;
    mapping(string => Document) public documents;
    mapping(address => string[]) public patientDocuments;
    mapping(address => mapping(address => AccessRecord)) public accessGrants;
    mapping(address => address[]) public patientDoctors;
    mapping(string => AuditLog[]) public documentAuditLogs;

    address[] public registeredUsers;

    // ========== EVENTS ==========

    event UserRegistered(address indexed userAddress, string name, Role role, uint256 timestamp);
    event DocumentUploaded(string indexed ipfsHash, string fileName, address indexed patientAddress, address indexed uploadedBy, uint256 timestamp);
    event AccessGranted(address indexed patientAddress, address indexed doctorAddress, uint256 expiresAt, uint256 timestamp);
    event AccessRevoked(address indexed patientAddress, address indexed doctorAddress, uint256 timestamp);
    event DocumentVerified(string indexed ipfsHash, address indexed verifiedBy, uint256 timestamp);
    event UserDeactivated(address indexed userAddress, uint256 timestamp);

    // ========== MODIFIERS ==========

    modifier onlyOwner() {
        require(msg.sender == owner, "MediVault: Caller is not owner");
        _;
    }

    modifier onlyAdmin() {
        require(
            users[msg.sender].role == Role.Admin || msg.sender == owner,
            "MediVault: Caller is not admin"
        );
        _;
    }

    modifier onlyDoctor() {
        require(users[msg.sender].role == Role.Doctor, "MediVault: Caller is not a doctor");
        _;
    }

    modifier onlyPatient() {
        require(users[msg.sender].role == Role.Patient, "MediVault: Caller is not a patient");
        _;
    }

    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "MediVault: User not registered");
        require(users[msg.sender].isActive, "MediVault: User account is deactivated");
        _;
    }

    modifier documentExists(string memory ipfsHash) {
        require(bytes(documents[ipfsHash].ipfsHash).length > 0, "MediVault: Document does not exist");
        _;
    }

    // ========== CONSTRUCTOR ==========

    constructor() {
        owner = msg.sender;

        users[msg.sender] = User({
            walletAddress: msg.sender,
            name: "Super Admin",
            email: "admin@medivault.com",
            role: Role.Admin,
            isRegistered: true,
            isActive: true,
            registeredAt: block.timestamp
        });

        registeredUsers.push(msg.sender);
        totalUsers = 1;

        emit UserRegistered(msg.sender, "Super Admin", Role.Admin, block.timestamp);
    }

    // ========== USER MANAGEMENT ==========

    function registerUser(
        address userAddress,
        string memory name,
        string memory email,
        Role role
    ) external onlyAdmin {
        require(userAddress != address(0), "MediVault: Invalid address");
        require(!users[userAddress].isRegistered, "MediVault: User already registered");
        require(role != Role.None, "MediVault: Invalid role");
        require(bytes(name).length > 0, "MediVault: Name cannot be empty");
        require(bytes(email).length > 0, "MediVault: Email cannot be empty");

        users[userAddress] = User({
            walletAddress: userAddress,
            name: name,
            email: email,
            role: role,
            isRegistered: true,
            isActive: true,
            registeredAt: block.timestamp
        });

        registeredUsers.push(userAddress);
        totalUsers++;

        emit UserRegistered(userAddress, name, role, block.timestamp);
    }

    function getUser(address userAddress) external view returns (User memory) {
        require(users[userAddress].isRegistered, "MediVault: User not found");
        return users[userAddress];
    }

    function deactivateUser(address userAddress) external onlyAdmin {
        require(users[userAddress].isRegistered, "MediVault: User not found");
        require(userAddress != owner, "MediVault: Cannot deactivate owner");
        users[userAddress].isActive = false;
        emit UserDeactivated(userAddress, block.timestamp);
    }

    function getAllUsers() external view onlyAdmin returns (address[] memory) {
        return registeredUsers;
    }

    // ========== DOCUMENT MANAGEMENT ==========

    function uploadDocument(
        string memory ipfsHash,
        string memory fileName,
        string memory documentType,
        address patientAddress
    ) external onlyRegistered {
        require(
            users[msg.sender].role == Role.Doctor || users[msg.sender].role == Role.Admin,
            "MediVault: Only doctors or admins can upload"
        );
        require(
            users[patientAddress].isRegistered && users[patientAddress].role == Role.Patient,
            "MediVault: Invalid patient address"
        );
        require(bytes(ipfsHash).length > 0, "MediVault: IPFS hash cannot be empty");
        require(bytes(documents[ipfsHash].ipfsHash).length == 0, "MediVault: Document already exists");
        require(bytes(fileName).length > 0, "MediVault: File name cannot be empty");

        documents[ipfsHash] = Document({
            ipfsHash: ipfsHash,
            fileName: fileName,
            documentType: documentType,
            patientAddress: patientAddress,
            uploadedBy: msg.sender,
            uploadedAt: block.timestamp,
            status: DocumentStatus.Active,
            isVerified: true
        });

        patientDocuments[patientAddress].push(ipfsHash);
        totalDocuments++;

        documentAuditLogs[ipfsHash].push(AuditLog({
            actor: msg.sender,
            action: "UPLOAD",
            details: string(abi.encodePacked("Uploaded: ", fileName)),
            timestamp: block.timestamp
        }));

        emit DocumentUploaded(ipfsHash, fileName, patientAddress, msg.sender, block.timestamp);
    }

    function getPatientDocuments(address patientAddress)
        external
        view
        onlyRegistered
        returns (string[] memory)
    {
        if (msg.sender == patientAddress) {
            return patientDocuments[patientAddress];
        }

        if (users[msg.sender].role == Role.Admin) {
            return patientDocuments[patientAddress];
        }

        if (users[msg.sender].role == Role.Doctor || users[msg.sender].role == Role.Student) {
            require(
                accessGrants[patientAddress][msg.sender].isActive,
                "MediVault: Access not granted by patient"
            );
            if (accessGrants[patientAddress][msg.sender].expiresAt > 0) {
                require(
                    block.timestamp <= accessGrants[patientAddress][msg.sender].expiresAt,
                    "MediVault: Access has expired"
                );
            }
            return patientDocuments[patientAddress];
        }

        revert("MediVault: Unauthorized access");
    }

    function getDocument(string memory ipfsHash)
        external
        view
        onlyRegistered
        documentExists(ipfsHash)
        returns (Document memory)
    {
        Document memory doc = documents[ipfsHash];

        if (msg.sender == doc.patientAddress) return doc;
        if (msg.sender == doc.uploadedBy) return doc;
        if (users[msg.sender].role == Role.Admin) return doc;

        if (users[msg.sender].role == Role.Doctor || users[msg.sender].role == Role.Student) {
            require(
                accessGrants[doc.patientAddress][msg.sender].isActive,
                "MediVault: Access not granted"
            );
        }

        return doc;
    }

    // ========== ACCESS CONTROL ==========

    function grantAccess(address doctorAddress, uint256 expiresAt)
        external
        onlyRegistered
        onlyPatient
    {
        require(
            users[doctorAddress].isRegistered &&
            (users[doctorAddress].role == Role.Doctor || users[doctorAddress].role == Role.Student),
            "MediVault: Invalid doctor address"
        );
        require(
            !accessGrants[msg.sender][doctorAddress].isActive,
            "MediVault: Access already granted"
        );

        if (expiresAt > 0) {
            require(expiresAt > block.timestamp, "MediVault: Expiry must be in the future");
        }

        accessGrants[msg.sender][doctorAddress] = AccessRecord({
            grantedTo: doctorAddress,
            grantedBy: msg.sender,
            grantedAt: block.timestamp,
            expiresAt: expiresAt,
            isActive: true
        });

        patientDoctors[msg.sender].push(doctorAddress);

        emit AccessGranted(msg.sender, doctorAddress, expiresAt, block.timestamp);
    }

    function revokeAccess(address doctorAddress)
        external
        onlyRegistered
        onlyPatient
    {
        require(
            accessGrants[msg.sender][doctorAddress].isActive,
            "MediVault: No active access to revoke"
        );

        accessGrants[msg.sender][doctorAddress].isActive = false;

        emit AccessRevoked(msg.sender, doctorAddress, block.timestamp);
    }

    function checkAccess(address patientAddress, address doctorAddress)
        external
        view
        returns (bool hasAccess, uint256 expiresAt)
    {
        AccessRecord memory record = accessGrants[patientAddress][doctorAddress];

        if (!record.isActive) return (false, 0);

        if (record.expiresAt > 0 && block.timestamp > record.expiresAt) {
            return (false, record.expiresAt);
        }

        return (true, record.expiresAt);
    }

    function getGrantedDoctors(address patientAddress)
        external
        view
        returns (address[] memory)
    {
        require(
            msg.sender == patientAddress || users[msg.sender].role == Role.Admin,
            "MediVault: Unauthorized"
        );
        return patientDoctors[patientAddress];
    }

    // ========== VERIFICATION ==========

    function verifyDocument(string memory ipfsHash)
        external
        returns (bool isVerified, address patientAddress, address uploadedBy, uint256 uploadedAt)
    {
        require(bytes(ipfsHash).length > 0, "MediVault: Invalid IPFS hash");

        Document memory doc = documents[ipfsHash];

        if (bytes(doc.ipfsHash).length == 0) {
            return (false, address(0), address(0), 0);
        }

        documentAuditLogs[ipfsHash].push(AuditLog({
            actor: msg.sender,
            action: "VERIFY",
            details: "Document verification performed",
            timestamp: block.timestamp
        }));

        emit DocumentVerified(ipfsHash, msg.sender, block.timestamp);

        return (doc.isVerified, doc.patientAddress, doc.uploadedBy, doc.uploadedAt);
    }

    function getDocumentAuditLogs(string memory ipfsHash)
        external
        view
        onlyRegistered
        documentExists(ipfsHash)
        returns (AuditLog[] memory)
    {
        return documentAuditLogs[ipfsHash];
    }

    // ========== UTILITY ==========

    function getStats() external view returns (
        uint256 _totalUsers,
        uint256 _totalDocuments,
        address _owner
    ) {
        return (totalUsers, totalDocuments, owner);
    }
}