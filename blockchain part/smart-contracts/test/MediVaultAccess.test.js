const MediVaultAccess = artifacts.require("MediVaultAccess");

contract("MediVaultAccess", (accounts) => {
  let instance;
  const admin   = accounts[0];
  const doctor  = accounts[1];
  const patient = accounts[2];
  const student = accounts[3];
  const doctor2 = accounts[4];

  before(async () => {
    instance = await MediVaultAccess.deployed();
  });

  // ── USER REGISTRATION ──────────────────────────────────
  describe("User Registration", () => {

    it("should have admin registered on deploy", async () => {
      const user = await instance.getUser(admin);
      assert.equal(user.role.toString(), "1", "Admin role should be 1");
    });

    it("should register a doctor", async () => {
      await instance.registerUser(doctor, "Dr. Test", "dr@test.com", 2, { from: admin });
      const user = await instance.getUser(doctor);
      assert.equal(user.role.toString(), "2", "Role should be Doctor (2)");
      assert.equal(user.isActive, true, "User should be active");
    });

    it("should register a patient", async () => {
      await instance.registerUser(patient, "Patient Test", "patient@test.com", 3, { from: admin });
      const user = await instance.getUser(patient);
      assert.equal(user.role.toString(), "3", "Role should be Patient (3)");
    });

    it("should reject duplicate registration", async () => {
      try {
        await instance.registerUser(doctor, "Dup", "dup@test.com", 2, { from: admin });
        assert.fail("Should have thrown");
      } catch (e) {
        assert.include(e.message, "already registered");
      }
    });

    it("should reject registration by non-admin", async () => {
      try {
        await instance.registerUser(accounts[9], "Test", "t@t.com", 2, { from: doctor });
        assert.fail("Should have thrown");
      } catch (e) {
        assert.include(e.message, "not admin");
      }
    });
  });

  // ── DOCUMENT UPLOAD ────────────────────────────────────
  describe("Document Upload", () => {
    const testHash = "QmTestHash123456789abcdef";

    it("should allow doctor to upload document", async () => {
      const tx = await instance.uploadDocument(
        testHash, "report.pdf", "lab_report", patient,
        { from: doctor }
      );
      assert.equal(tx.logs[0].event, "DocumentUploaded");
    });

    it("should store document with correct data", async () => {
      const doc = await instance.getDocument(testHash, { from: doctor });
      assert.equal(doc.fileName, "report.pdf");
      assert.equal(doc.patientAddress, patient);
      assert.equal(doc.isVerified, true);
    });

    it("should return document in patient list", async () => {
      const docs = await instance.getPatientDocuments(patient, { from: patient });
      assert.equal(docs.length, 1);
      assert.equal(docs[0], testHash);
    });

    it("should reject duplicate IPFS hash", async () => {
      try {
        await instance.uploadDocument(testHash, "dup.pdf", "lab_report", patient, { from: doctor });
        assert.fail("Should have thrown");
      } catch (e) {
        assert.include(e.message, "already exists");
      }
    });
  });

  // ── ACCESS CONTROL ─────────────────────────────────────
  describe("Access Control", () => {

    it("should allow patient to grant access to doctor", async () => {
      const tx = await instance.grantAccess(doctor, 0, { from: patient });
      assert.equal(tx.logs[0].event, "AccessGranted");
    });

    it("should confirm access is active", async () => {
      const [hasAccess] = await instance.checkAccess(patient, doctor);
      assert.isTrue(hasAccess);
    });

    it("should block doctor without access from viewing", async () => {
      await instance.registerUser(doctor2, "Dr2", "d2@test.com", 2, { from: admin });
      try {
        await instance.getPatientDocuments(patient, { from: doctor2 });
        assert.fail("Should have thrown");
      } catch (e) {
        assert.include(e.message, "Access not granted");
      }
    });

    it("should allow patient to revoke access", async () => {
      await instance.revokeAccess(doctor, { from: patient });
      const [hasAccess] = await instance.checkAccess(patient, doctor);
      assert.isFalse(hasAccess);
    });
  });

  // ── VERIFICATION ───────────────────────────────────────
  describe("Document Verification", () => {

    it("should verify existing document returns true", async () => {
      const result = await instance.verifyDocument.call("QmTestHash123456789abcdef");
      assert.isTrue(result[0]);
    });

    it("should return false for non-existent document", async () => {
      const result = await instance.verifyDocument.call("QmFakeHashDoesNotExist999");
      assert.isFalse(result[0]);
    });
  });

  // ── STATS ──────────────────────────────────────────────
  describe("Contract Stats", () => {

    it("should return correct total users count", async () => {
      const [totalUsers] = await instance.getStats();
      assert.isAbove(Number(totalUsers), 0);
    });
  });
});