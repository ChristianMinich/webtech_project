/** The test repository for service */

const svc = require("../services");
const { CheckPassword } = require("../services/passwordValidator");

describe("Check password validation", () =>{

    /**
     * Checks the value of password which is supossed to be true
     */
    test("Valid password", () => {
        const password = "Abc123";
        const result = CheckPassword(password);
        expect(result).toBe(true);
    });

    /**
     * Checks the value of password which is supossed to be false
     * because it is null
     */
    test("Invalid password: null pointer", async() =>{
        const password = null;
        const result = CheckPassword(password);
        expect(result).toBe(false);
    });

    /**
     * Checks the value of password which is supossed to be false
     * because it contains less than 6 characters
     */
    test("Invalid password: less than 6", async() =>{
        const password = "Abc12";
        const result = CheckPassword(password);
        expect(result).toBe(false);
    });

    /**
     * Checks the value of password which is supossed to be false
     * because it is an empty password
     */
    test("Invalid password: empty", () => {
        const password = "";
        const result = CheckPassword(password);
        expect(result).toBe(false);
    });

    /**
     * Checks the value of password which is supossed to be false
     * because it does not contain uppercase letter
     */
    test("Invalid password: no uppercase letter", () => {
        const password = "abc123";
        const result = CheckPassword(password);
        expect(result).toBe(false);
    });

    /**
     * Checks the value of password which is supossed to be false
     * because it does not contain lowercase letter
     */
    test("Invalid password: no lowercase letter", () => {
        const password = "ABC123";
        const result = CheckPassword(password);
        expect(result).toBe(false);
    });

    /**
     * Checks the value of password which is supossed to be false
     * because it does not contain any numbers
     */
    test("Invalid password: no numbers", () => {
        const password = "Abcdef";
        const result = CheckPassword(password);
        expect(result).toBe(false);
    });

    /**
     * Checks the value of password which is supossed to be false
     * because it contains more than 20 characters
     */
    test("Invalid password: more than 20", () => {
        const password = "Abcdef12345678901234X";
        const result = CheckPassword(password);
        expect(result).toBe(false);
    });
});

