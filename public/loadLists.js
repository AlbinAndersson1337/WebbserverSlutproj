document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/lists", {
    credentials: "include", // Se till att cookies med session-ID skickas med
  })
    .then((response) => response.json())
    .then((lists) => {
      const listsContainer = document.getElementById("lists");
      lists.forEach((list) => {
        const listElement = document.createElement("div");
        listElement.textContent = list.list_name;
        listsContainer.appendChild(listElement);
      });
    })
    .catch((error) => console.error("Error loading lists:", error));
});
