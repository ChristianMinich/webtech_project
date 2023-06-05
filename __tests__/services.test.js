/** The test repository for service */

const svc = require("../services");
const { CheckPassword } = require("../services/passwordValidator");

describe("Check password validation", () =>{

    /**
     * Checks the value of passwordValid which is supossed to be true
     */
    test("Valid password", () => {
        const password = "Abc123";
        const result = CheckPassword(password);
        expect(result).toBe(true);
    });

    /**
     * Checks the value of passwordNotValid which is supossed to be false
     */
    test("Not valid password", async() =>{
        const passwordNotValid = "Abc12";
        const result = CheckPassword(passwordNotValid);
        expect(result).toBe(false);
    });

});

describe("Check Login", () =>{
    const correctUsers = ["admin", "Admin", "ADMIN"];
    const correctUser = "admin";
    const correctPassword = "admin";
    const wrongUsers = ["peter", "amin", "ad min", " admin", "*admin", "*admin*", "?admin"];
    const wrongPasswords = ["admin*", "Hello", "Admin", "ADMIN", "x"];
    const empty = ["", null, undefined];

    // Correct username & password
    correctUsers.forEach((user) => {
        test("Access (admin)", async () => {
            let res = await svc.login(user, correctPassword);
            expect(res.status).toBe(200);
            expect(res.message).toEqual("login successful");
            expect(res).toHaveProperty('token');
            expect(res.token).toBeTruthy();
        });
    });

    // Wrong username & "correct" password
    wrongUsers.forEach((user) => {
        test("Denied: User not found", async () => {
            let res = await svc.login(user, correctPassword);
            expect(res.status).toBe(401);
            expect(res.message).toEqual("user not found");
            expect(res.token).toBeUndefined();
        });
    });

    // Wrong password & correct username
    wrongPasswords.forEach((password) => {
        test("Denied: Wrong password (admin)", async () => {
            let res = await svc.login(correctUser, password);
            expect(res.status).toBe(401);
            expect(res.message).toEqual("wrong password");
            expect(res.token).toBeUndefined();
        });
    });

    // Empty username ...
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

    // Empty password ...
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