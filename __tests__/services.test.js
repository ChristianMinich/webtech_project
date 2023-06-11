/** The test repository for services. */

const svc = require("../services");
const { CheckPassword } = require("../services/passwordValidator");
const { login } = require("../services");
const { createUser } = require("../repositories/userRepository");


/**
 * This is the test section for the password validation.
 */
describe("Check password validation", () =>{

    /**
     * Checks the value of password which is supossed to be true.
     */
    test("Valid password", async() => {
        const password = "Abc123";
        const result = CheckPassword(password);
        expect(result).toBe(true);
    });

    /**
     * Checks the value of password which is supossed to be false
     * because it is null.
     */
    test("Invalid password: null pointer", async() =>{
        const password = null;
        const result = CheckPassword(password);
        expect(result).toBe(false);
    });

    /**
     * Checks the value of password which is supossed to be false
     * because it contains less than 6 characters.
     */
    test("Invalid password: less than 6", async() =>{
        const password = "Abc12";
        const result = CheckPassword(password);
        expect(result).toBe(false);
    });

    /**
     * Checks the value of password which is supossed to be false
     * because it is an empty password.
     */
    test("Invalid password: empty", async() => {
        const password = "";
        const result = CheckPassword(password);
        expect(result).toBe(false);
    });

    /**
     * Checks the value of password which is supossed to be false
     * because it does not contain uppercase letter.
     */
    test("Invalid password: no uppercase letter", async() => {
        const password = "abc123";
        const result = CheckPassword(password);
        expect(result).toBe(false);
    });

    /**
     * Checks the value of password which is supossed to be false
     * because it does not contain lowercase letter.
     */
    test("Invalid password: no lowercase letter", async() => {
        const password = "ABC123";
        const result = CheckPassword(password);
        expect(result).toBe(false);
    });

    /**
     * Checks the value of password which is supossed to be false
     * because it does not contain any numbers.
     */
    test("Invalid password: no numbers", async() => {
        const password = "Abcdef";
        const result = CheckPassword(password);
        expect(result).toBe(false);
    });

    /**
     * Checks the value of password which is supossed to be false
     * because it contains more than 20 characters.
     */
    test("Invalid password: more than 20", async() => {
        const password = "Abcdef12345678901234X";
        const result = CheckPassword(password);
        expect(result).toBe(false);
    });
});



/**
 * This is the test section for create user.
 */
describe("Create User", () => {

    /**
     * Checks the value of the username and password
     * which is supossed to be defined.
     */
    test("Valid username and password", async() => {
        const username = "testuser";
        const password = "Password123";
        const result = createUser(username, password);
        expect(result).toBeUndefined();
    });

    /**
     * Checks the value of the username
     * which is supossed to be empty and undefined.
     */
    test("Empty username", async() => {
        const username = "";
        const password = "Password123";
        const result = createUser(username, password);
        expect(result).toBeUndefined();
    });

    /**
     * Checks the value of the password
     * which is supossed to be empty and undefined.
     */
    test("Empty password", async() => {
        const username = "testuser";
        const password = "";
        const result = createUser(username, password);
        expect(result).toBeUndefined();
    });

    /**
     * Checks the value of the username
     * which is supossed to be null and undefined.
     */
    test("Null username", async() => {
        const username = null;
        const password = "Password123";
        const result = createUser(username, password);
        expect(result).toBeUndefined();
    });

    /**
     * Checks the value of the password which
     * is supossed to be null and undefined.
     */
    test("Null password", async() => {
        const username = "testuser";
        const password = null;
        const result = createUser(username, password);
        expect(result).toBeUndefined();
    });
});