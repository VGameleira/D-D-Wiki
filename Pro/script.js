const toggleButton = document.getElementById("darkModeToggle")

const body = document.body

toggleButton.addEventListener("click", () => { body.classeList.toggle("dark-Mode") });

if (body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");
} else { localStorage.setItem("darkMode", "disabled"); }