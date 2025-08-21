const buttons = document.querySelectorAll(".tab-btn");
    const tabs = document.querySelectorAll(".tab");

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        buttons.forEach(btn => btn.classList.remove("active"));
        tabs.forEach(tab => tab.style.display = "none");

        button.classList.add("active");
        document.getElementById(button.dataset.tab).style.display = "block";
      });
    });

    function generatePassword() {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|,.?";
      const length = 14;
      let pass = "";
      for (let i = 0; i < length; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      document.getElementById("passwordBox").innerText = pass;
    }