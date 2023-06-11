window.addEventListener("load", function () {
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("usernameInput");
  const passwordInput = document.getElementById("passwordInput");

  // Login: Prüfen der eingegebenen Daten und Weiterleitung bei Erfolg
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const value = Object.fromEntries(formData.entries());

    console.log("submitted");
    fetch("/api/auth", {
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
            var element = document.querySelector(".passwordHint");
              if (element) {
              element.style.display = "block";
            }
          } else if (msg === "password not set" || msg === "wrong password") {
            passwordInput.classList.remove("error");
            passwordInput.offsetWidth;
            passwordInput.classList.add("error");
            var element = document.querySelector(".passwordHint");
              if (element) {
              element.style.display = "block";
            }
          } else {
            usernameInput.classList.remove("error");
            passwordInput.classList.remove("error");
            usernameInput.offsetWidth;
            passwordInput.offsetWidth;
            usernameInput.classList.add("error");
            passwordInput.classList.add("error");
            var element = document.querySelector(".passwordHint");
              if (element) {
              element.style.display = "block";
            }
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
