document.addEventListener("DOMContentLoaded", () => {
  const addListButton = document.querySelector(".btn-add");
  const listNameInput = document.querySelector("#list-name-input");
  const saveListButton = document.querySelector("#save-list-button");
  const myListContainer = document.querySelector(".todo-lists");

  addListButton.addEventListener("click", () => {
    console.log("List button clicked");
    listNameInput.classList.add("show");
    saveListButton.classList.add("show");
  });

  saveListButton.addEventListener("click", async () => {
    const listName = listNameInput.value.trim();
    if (listName) {
      try {
        // Antag att du har ett API-endpoint som hanterar POST-request för att skapa en ny lista
        const response = await fetch("/api/lists", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ list_name: listName }),
          credentials: "include",
        });

        if (response.ok) {
          const newList = await response.json();
          // Lägg till den nya listan i "My Lists" på sidan
          const listItem = document.createElement("div");
          listItem.textContent = newList.name; // Anpassa baserat på ditt svar från servern
          myListContainer.appendChild(listItem);

          // Rensa input och dölj fälten igen
          listNameInput.value = "";
          listNameInput.style.display = "none";
          saveListButton.style.display = "none";
        } else {
          console.error("Failed to create the list");
        }
      } catch (error) {
        console.error("Error:", error);
        console.error("Error on creating list:", error);
        res
          .status(500)
          .json({ message: "Internal server error", error: error.toString() });
      }
    }
  });
});
