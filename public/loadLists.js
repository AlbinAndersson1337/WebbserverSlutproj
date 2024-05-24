async function loadLists() {
  try {
    const response = await fetch("/api/lists");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const lists = await response.json();
    const listsContainer = document.getElementById("lists-container");
    listsContainer.innerHTML = "";

    lists.forEach((list) => {
      const listItem = document.createElement("div");
      listItem.className = "list-item";
      listItem.innerHTML = `
        ${list.list_name}
        <button class="delete-btn" data-id="${list.list_id}">X</button>
      `;
      listsContainer.appendChild(listItem);
    });

    // Attach delete event listeners to new buttons
    attachDeleteEventListeners();
  } catch (error) {
    console.error("Error loading lists:", error);
  }
}

function attachDeleteEventListeners() {
  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const listId = event.target.getAttribute("data-id");

      try {
        const response = await fetch(`/api/lists/${listId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete list");
        }

        const result = await response.json();
        console.log(result.message);

        // Reload lists to reflect the deletion
        loadLists();
      } catch (error) {
        console.error("Error:", error);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", loadLists);
