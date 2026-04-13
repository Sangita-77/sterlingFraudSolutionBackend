import bcrypt from "bcrypt";

// The hashed password from your database
const hashedPassword = "$2b$10$JO3g0iUHubpXN1rEnuC4AegTJqLelGmr9c7W2137G27rOEfs/asVi";

// Test different passwords
const testPasswords = [
  "12345678",
  "sangita",
  "demo123",
  "password",
  "123456",
];

console.log("\nTesting passwords against stored hash...\n");

for (const pwd of testPasswords) {
  bcrypt.compare(pwd, hashedPassword, (err, isMatch) => {
    if (err) {
      console.log(`❌ Error testing "${pwd}":`, err.message);
    } else {
      console.log(`${isMatch ? "✅" : "❌"} Password "${pwd}": ${isMatch ? "MATCH!" : "no match"}`);
    }
  });
}
