window.addEventListener("load", function () {
  const registerForm = document.getElementById("registerForm");
  const usernameInput = document.getElementById("usernameInput");
  const passwordInput = document.getElementById("passwordInput");

  // Register: Prüfen der eingegebenen Daten und Weiterleitung bei Erfolg
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const value = Object.fromEntries(formData.entries());

    console.log("submitted");
    fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(value),
    })
      .then((res) => {
        if (res.redirected) {
          window.location.replace(res.url);
        } else {
          return res.text();
        }
      })
      .then((msg) => {
        if (msg) {
          if (msg === "username not set" || msg === "user not found") {
            usernameInput.classList.remove("error");
            usernameInput.offsetWidth;
            usernameInput.classList.add("error");
          } else if (msg === "password not set" || msg === "wrong password") {
            passwordInput.classList.remove("error");
            passwordInput.offsetWidth;
            passwordInput.classList.add("error");
          } else {
            usernameInput.classList.remove("error");
            passwordInput.classList.remove("error");
            usernameInput.offsetWidth;
            passwordInput.offsetWidth;
            usernameInput.classList.add("error");
            passwordInput.classList.add("error");
          }
        }
      })
      .catch((err) => {
        console.error(err.message);
      });
  });

  // Entfernen von Markierungen nach neuer Eingabe
  usernameInput.addEventListener("change", () => {
    if (this.classList) this.classList.remove("error");
  });

  // Entfernen von Markierungen nach neuer Eingabe
  passwordInput.addEventListener("change", () => {
    if (this.classList) this.classList.remove("error");
  });
});
