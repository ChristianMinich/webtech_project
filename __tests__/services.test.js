/** The test repository for services */

const svc = require("../services");
const { CheckPassword } = require("../services/passwordValidator");
const { login } = require("../services");
const { createUser } = require("../repositories/userRepository");


/**
 * This is the test section for the password validation
 */
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


/**
 * This is the test section for login
 */
describe("Check Login", () => {
    const correctUsers = ["admin", "Admin", "ADMIN"];
    const correctUser = "admin";
    const correctPassword = "admin";
    const wrongUsers = ["peter", "amin", "ad min", " admin", "*admin", "*admin*", "?admin"];
    const wrongPasswords = ["admin*", "Hello", "Admin", "ADMIN", "x"];
    const empty = ["", null, undefined];


    /**
     * Checks the values of username and passoword are correct
     */
    correctUsers.forEach((user) => {
        test("Access (admin)", async () => {
            let res = await svc.login(user, correctPassword);
            expect(res.status).toBe(200);
            expect(res.message).toEqual("login successful");
            expect(res).toHaveProperty('token');
            expect(res.token).toBeTruthy();
        });
    });

    /**
     * Checks if the username is wrong and the passowrd is correct
     * which is supossed to be undefined
     */
    wrongUsers.forEach((user) => {
        test("Denied: User not found", async () => {
            let res = await svc.login(user, correctPassword);
            expect(res.status).toBe(401);
            expect(res.message).toEqual("user not found");
            expect(res.token).toBeUndefined();
        });
    });

    /**
     * Checks if the username is correct and the passowrd is wrong
     * which is supossed to be undefined
     */
    wrongPasswords.forEach((password) => {
        test("Denied: Wrong password (admin)", async () => {
            let res = await svc.login(correctUser, password);
            expect(res.status).toBe(401);
            expect(res.message).toEqual("wrong password");
            expect(res.token).toBeUndefined();
        });
    });

    /**
     * Checks if the username is empty
     * which is supossed to be undefined
     */
    empty.forEach((emptyUser) => {
        // ... with wrong password
        wrongPasswords.forEach((password) => {
            test("Denied: Username not set", async () => {
                let res = await svc.login(emptyUser, password);
                expect(res.status).toBe(400);
                expect(res.message).toEqual("username not set");
                expect(res.token).toBeUndefined();
            });
        });
        // ... with "correct" password
        test("Denied: Username not set", async () => {
            let res = await svc.login(emptyUser, correctPassword);
            expect(res.status).toBe(400);
            expect(res.message).toEqual("username not set");
            expect(res.token).toBeUndefined();
        });
        // ... with empty password
        empty.forEach((emptyPassword) => {
            test("Denied: Username not set", async () => {
                let res = await svc.login(emptyUser, emptyPassword);
                expect(res.status).toBe(400);
                expect(res.message).toEqual("username not set");
                expect(res.token).toBeUndefined();
            });
        });
    });

    /**
     * Checks if the passowrd is empty
     * which is supossed to be undefined
     */
    empty.forEach((emptyPassword) => {
        // ... with correct username
        correctUsers.forEach((user) => {
            test("Denied: Password not set", async () => {
                let res = await svc.login(user, emptyPassword);
                expect(res.status).toBe(400);
                expect(res.message).toEqual("password not set");
                expect(res.token).toBeUndefined();
            });
        });
        // ... with wrong username
        wrongUsers.forEach((user) => {
            test("Denied: Password not set", async () => {
                let res = await svc.login(user, emptyPassword);
                expect(res.status).toBe(400);
                expect(res.message).toEqual("password not set");
                expect(res.token).toBeUndefined();
            });
        });
        // ... with empty username: (see "Denied: Username not set")
    });
});


/**
 * This is the test section for create user
 */
describe("Create User", () => {

    /**
     * Checks the value of the username and password
     * which is supossed to be defined
     */
    test("Valid username and password", () => {
        const username = "testuser";
        const password = "Password123";
        const result = createUser(username, password);
        expect(result).toBeUndefined();
    });

    /**
     * Checks the value of the username
     * which is supossed to be empty and undefined
     */
    test("Empty username", () => {
        const username = "";
        const password = "Password123";
        const result = createUser(username, password);
        expect(result).toBeUndefined();
    });

    /**
     * Checks the value of the password
     * which is supossed to be empty and undefined
     */
    test("Empty password", () => {
        const username = "testuser";
        const password = "";
        const result = createUser(username, password);
        expect(result).toBeUndefined();
    });

    /**
     * Checks the value of the username
     * which is supossed to be null and undefined
     */
    test("Null username", () => {
        const username = null;
        const password = "Password123";
        const result = createUser(username, password);
        expect(result).toBeUndefined();
    });

    /**
     * Checks the value of the password
     * which is supossed to be null and undefined
     */
    test("Null password", () => {
        const username = "testuser";
        const password = null;
        const result = createUser(username, password);
        expect(result).toBeUndefined();
    });
});

