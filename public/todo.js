document.addEventListener('DOMContentLoaded', (event) => {
  const myListContainer = document.querySelector(".todo-lists");
let selectedTodoID = null;


const todoLists = document.querySelectorAll('.todo-lists .list-item');
todoLists.forEach(div => {
    div.addEventListener('click', function() {
      //Stylar färgen på alla andra divar till vanligt (detta är bara för att det ska se snyggt ut)
      mediaDivs.forEach(otherDiv => {
          otherDiv.style.backgroundColor = ""; 
      });

      //stylar färgen på den div som klickas på till röd (detta är bara för att det ska se snyggt ut)
      this.style.backgroundColor = "red"; 

      //Sparar listID för den klickade diven
      selectedTodoID = this.querySelector('.list-item').textContent;
    });
});

const deleteButton = document.querySelector('.btn-delete');

deleteButton.addEventListener('click', function() {
//Om en todo är vald så skickas den till backend för att tas bort
if (selectedTodoID) {
  console.log("clicked")
  //Inställningar för hur den ska skickas
  const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({listID: selectedTodoID})
  };
  fetch('/delete', options)
      .then(response => {
          if (response.ok) {
              location.reload();
          } else {
              throw new Error('Failed to send data');
          }
      })
    }
 });
});



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
  })
});
