// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MediVaultAccess {

    enum Role { None, Admin, Doctor, Nurse, Student, Patient }

    struct Document {
        string ipfsHash;
        string fileName;
        address uploader;
        address patientAddress; // Patient who owns this document
        uint256 timestamp;
        bool isDeleted;
    }

    mapping(address => Role) public userRoles;
    mapping(address => Document[]) private userDocuments;
    mapping(address => mapping(uint256 => bool)) private documentDeleted; // user => docIndex => deleted
    mapping(string => uint256) private documentIndexByHash; // ipfsHash => document index
    mapping(address => uint256[]) private patientDocuments; // patientAddress => document indices

    event UserRegistered(address indexed user, Role role);
    event DocumentUploaded(
        address indexed uploader, 
        address indexed patientAddress,
        string ipfsHash, 
        string fileName,
        uint256 timestamp
    );
    event DocumentDeleted(
        address indexed deleter,
        address indexed patientAddress,
        string ipfsHash,
        uint256 timestamp
    );

    modifier onlyAdmin() {
        require(userRoles[msg.sender] == Role.Admin, "Access restricted to Admin");
        _;
    }

    modifier onlyDoctorOrNurse() {
        require(
            userRoles[msg.sender] == Role.Doctor || userRoles[msg.sender] == Role.Nurse,
            "Access restricted to Doctor or Nurse"
        );
        _;
    }

    modifier onlyDoctorNurseOrAdmin() {
        require(
            userRoles[msg.sender] == Role.Doctor || 
            userRoles[msg.sender] == Role.Nurse || 
            userRoles[msg.sender] == Role.Admin,
            "Access restricted to Doctor, Nurse, or Admin"
        );
        _;
    }

    modifier onlyValidRole() {
        require(userRoles[msg.sender] != Role.None, "User not registered");
        _;
    }

    constructor() {
        userRoles[msg.sender] = Role.Admin;
        emit UserRegistered(msg.sender, Role.Admin);
    }

    function registerUser(address user, Role role) public onlyAdmin {
        require(role != Role.None, "Invalid role");
        require(user != address(0), "Invalid address");
        userRoles[user] = role;
        emit UserRegistered(user, role);
    }

    // Admin, Doctor, Nurse can upload documents
    // Admin can upload for any patient
    // Doctor/Nurse can upload for patients
    function uploadDocument(
        string memory ipfsHash,
        string memory fileName,
        address patientAddress
    ) public onlyValidRole {
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(bytes(fileName).length > 0, "File name required");
        
        // Admin can upload for any patient
        if (userRoles[msg.sender] == Role.Admin) {
            require(patientAddress != address(0), "Patient address required");
        } 
        // Doctor/Nurse can upload for patients
        else if (userRoles[msg.sender] == Role.Doctor || userRoles[msg.sender] == Role.Nurse) {
            require(patientAddress != address(0), "Patient address required");
            require(userRoles[patientAddress] == Role.Patient, "Target must be a patient");
        }
        // Patients cannot upload (only view their own)
        else {
            revert("Only Admin, Doctor, or Nurse can upload documents");
        }

        Document memory newDoc = Document({
            ipfsHash: ipfsHash,
            fileName: fileName,
            uploader: msg.sender,
            patientAddress: patientAddress,
            timestamp: block.timestamp,
            isDeleted: false
        });

        userDocuments[patientAddress].push(newDoc);
        uint256 docIndex = userDocuments[patientAddress].length - 1;
        documentIndexByHash[ipfsHash] = docIndex;
        patientDocuments[patientAddress].push(docIndex);

        emit DocumentUploaded(msg.sender, patientAddress, ipfsHash, fileName, block.timestamp);
    }

    // Only Admin can delete documents
    function deleteDocument(address patientAddress, uint256 documentIndex) public onlyAdmin {
        require(documentIndex < userDocuments[patientAddress].length, "Invalid document index");
        require(!userDocuments[patientAddress][documentIndex].isDeleted, "Document already deleted");
        
        userDocuments[patientAddress][documentIndex].isDeleted = true;
        documentDeleted[patientAddress][documentIndex] = true;
        
        string memory ipfsHash = userDocuments[patientAddress][documentIndex].ipfsHash;
        emit DocumentDeleted(msg.sender, patientAddress, ipfsHash, block.timestamp);
    }

    // Get documents for a specific patient
    // Patients can only see their own documents
    // Admin, Doctor, Nurse, Student can view patient documents
    function getPatientDocuments(address patientAddress) public view returns (Document[] memory) {
        require(userRoles[msg.sender] != Role.None, "User not registered");
        
        // Patients can only view their own documents
        if (userRoles[msg.sender] == Role.Patient) {
            require(msg.sender == patientAddress, "Patients can only view their own documents");
        }
        
        // Filter out deleted documents
        Document[] memory allDocs = userDocuments[patientAddress];
        uint256 activeCount = 0;
        
        // Count active documents
        for (uint256 i = 0; i < allDocs.length; i++) {
            if (!allDocs[i].isDeleted) {
                activeCount++;
            }
        }
        
        // Build result array
        Document[] memory result = new Document[](activeCount);
        uint256 resultIndex = 0;
        
        for (uint256 i = 0; i < allDocs.length; i++) {
            if (!allDocs[i].isDeleted) {
                result[resultIndex] = allDocs[i];
                resultIndex++;
            }
        }
        
        return result;
    }

    // Get all documents uploaded by the caller
    function getMyUploadedDocuments() public view onlyValidRole returns (Document[] memory) {
        // This is for Admin, Doctor, Nurse to see what they uploaded
        require(
            userRoles[msg.sender] == Role.Admin || 
            userRoles[msg.sender] == Role.Doctor || 
            userRoles[msg.sender] == Role.Nurse,
            "Only Admin, Doctor, or Nurse can view uploaded documents"
        );
        
        // We need to iterate through all patients to find documents uploaded by msg.sender
        // This is a simplified version - in production, you might want a mapping
        // For now, return empty array as this requires more complex logic
        Document[] memory empty;
        return empty;
    }

    // Get user role
    function getUserRole(address user) public view returns (Role) {
        return userRoles[user];
    }

    // Check if user has a valid role
    function isRegistered(address user) public view returns (bool) {
        return userRoles[user] != Role.None;
    }
}
