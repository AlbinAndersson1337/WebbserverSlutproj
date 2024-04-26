fetch("/api/lists", {
  credentials: "include",
})
  .then((response) => response.json())
  .then((lists) => {
    const listsContainer = document.getElementById("lists");
    console.log("Lists:", lists);
    lists.forEach((list) => {
      const listElement = document.createElement("div");
      listElement.textContent = list.list_name;
      listsContainer.appendChild(listElement);
    });
  })
  .catch((error) => console.error("Error loading lists:", error));
