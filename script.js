// This file handles both the home page and all section pages.

const page = document.body.dataset.page;

if (page === "home") {
  setupHomePage();
} else {
  setupSectionPage(page);
}

// ---------------- Home page logic ----------------
function setupHomePage() {
  const greetingEl = document.getElementById("greeting");
  const dateTextEl = document.getElementById("dateText");
  const motivationEl = document.getElementById("motivation");
  const yearProgressValue = document.getElementById("yearProgressValue");
  const yearProgressFill = document.getElementById("yearProgressFill");

  const now = new Date();
  const hour = now.getHours();
  let greeting = "Good evening";

  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 17) {
    greeting = "Good afternoon";
  }

  const day = now.toLocaleDateString("en-US", { weekday: "long" });
  const date = now.getDate();
  const month = now.toLocaleDateString("en-US", { month: "long" });

  greetingEl.textContent = `${greeting}!`;
  dateTextEl.textContent = `Today is ${day}, ${date} ${month}.`;

  const messages = [
    "You're doing amazing — one small step today is enough. 💛",
    "I believe in you, always. Keep shining! ✨",
    "You are stronger than you think and loved more than you know. ❤️",
    "Keep going, your future self is smiling at you. 😊",
    "Progress over perfection. You’ve got this! 🌸"
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  greetingEl.textContent = `${greeting}, Arkadon!`;
  motivationEl.textContent = randomMessage;

  const yearPercent = calculateYearProgress(now);
  const currentYear = now.getFullYear();

  yearProgressFill.style.width = `${yearPercent}%`;
  yearProgressValue.textContent = `${yearPercent}%`;
  document.getElementById("yearProgressCaption").textContent = `${yearPercent}% of ${currentYear} passed`;
}

function calculateYearProgress(currentDate) {
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
  const startOfNextYear = new Date(currentDate.getFullYear() + 1, 0, 1);
  const percent = Math.floor(((currentDate - startOfYear) / (startOfNextYear - startOfYear)) * 100);
  return Math.min(100, Math.max(0, percent));
}

// ---------------- Section page logic ----------------
// This function sets up the dashboard for category pages (IITM, 100xDevs, etc)
// It handles: checkboxes, progress calculation, data persistence, and the completion popup
function setupSectionPage(sectionName) {
  // ===== DOM Elements =====
  // Checklist container and input for adding new tasks
  const checklistContainer = document.getElementById("checklistContainer");
  const newChecklistInput = document.getElementById("newChecklistItem");
  const addChecklistBtn = document.getElementById("addChecklistBtn");
  
  // Time tracking and notes inputs
  const timeSpentInput = document.getElementById("timeSpent");
  const remarksInput = document.getElementById("remarks");
  const goalsInput = document.getElementById("goalsText");
  
  // Progress bar elements - these update in real-time
  const progressBar = document.getElementById("progressBar");      // The filled portion
  const progressText = document.getElementById("progressText");    // Percentage text (e.g. "50%")
  
  // Celebration popup that shows when all tasks are done
  const modal = document.getElementById("completeModal");
  const closeModalBtn = document.getElementById("closeModal");

  // ===== Data Persistence (localStorage) =====
  // Each category page saves its data under a unique key
  // e.g., "dailyDashboard_iitm", "dailyDashboard_devs", etc
  const storageKey = `dailyDashboard_${sectionName}`;
  
  // Load previously saved data from localStorage (or empty object if first visit)
  const savedData = JSON.parse(localStorage.getItem(storageKey) || "{}");

  // ===== Restore Saved State =====
  // Load initial checkboxes and restore their checked/unchecked states from last visit
  let checkboxes = document.querySelectorAll(".task-checkbox");
  checkboxes.forEach((checkbox, index) => {
    // Set checkbox to checked if it was checked last time
    checkbox.checked = Boolean(savedData.checkboxes?.[index]);
  });

  // Load dynamic items that the user previously added
  if (savedData.dynamicItems && Array.isArray(savedData.dynamicItems)) {
    savedData.dynamicItems.forEach((itemText) => {
      addChecklistItemToDOM(itemText, false);
    });
  }

  // Restore other fields.
  if (savedData.timeSpent) {
    timeSpentInput.value = savedData.timeSpent;
  }

  if (savedData.remarks) {
    remarksInput.value = savedData.remarks;
  }

  if (savedData.goals) {
    goalsInput.value = savedData.goals;
  }

  // ===== Re-query and Setup Event Listeners =====
  // Re-query checkboxes after loading dynamic items (so we catch all of them)
  checkboxes = document.querySelectorAll(".task-checkbox");
  
  // Reload checkbox states after dynamic items are added
  checkboxes.forEach((checkbox, index) => {
    checkbox.checked = Boolean(savedData.checkboxes?.[index]);
    
    // When user checks/unchecks a box: update progress and save data
    checkbox.addEventListener("change", () => {
      updateProgress();
      saveSectionData();
    });
  });

  // When user changes any text input, save the data
  timeSpentInput.addEventListener("input", saveSectionData);
  remarksInput.addEventListener("input", saveSectionData);
  goalsInput.addEventListener("input", saveSectionData);

  // Add new checklist item when "Add" button is clicked
  addChecklistBtn.addEventListener("click", addNewItem);
  
  // Or press Enter key to add a new item
  newChecklistInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addNewItem();
    }
  });

  // Close the celebration popup when user clicks Close button
  closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Calculate and display progress when page first loads
  updateProgress();

  function addNewItem() {
    // Get text the user typed in the input field
    const itemText = newChecklistInput.value.trim();
    
    // Validate: don't add empty tasks
    if (itemText === "") {
      alert("Please enter a task!");
      return;
    }
    
    // Create a new checkbox item in the DOM
    addChecklistItemToDOM(itemText, true);
    
    // Clear the input field for the next task
    newChecklistInput.value = "";
    
    // Recalculate progress (now that we have a new task)
    updateProgress();
    
    // Save everything to localStorage
    saveSectionData();
  }

  function addChecklistItemToDOM(itemText, isFocused = false) {
    // Create a wrapper div to hold the checkbox label and remove button
    const wrapper = document.createElement("div");
    wrapper.className = "checkbox-item-wrapper";
    
    // Create the label and checkbox elements
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    
    // Create the text label for the checkbox
    const span = document.createElement("span");
    span.textContent = itemText;
    
    // Combine checkbox and text into a label
    label.appendChild(checkbox);
    label.appendChild(span);
    
    // Create a "Remove" button to delete this task
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      // Delete the entire wrapper (checkbox + text + button)
      wrapper.remove();
      // Refresh progress calculation
      updateProgress();
      // Save the updated data
      saveSectionData();
    });
    
    // When user checks/unchecks this new checkbox
    checkbox.addEventListener("change", () => {
      updateProgress();
      saveSectionData();
    });
    
    // Combine label and remove button into the wrapper
    wrapper.appendChild(label);
    wrapper.appendChild(removeBtn);
    
    // Add the complete wrapper to the checklist container (visible on page)
    checklistContainer.appendChild(wrapper);
    
    // Optionally focus on the new checkbox (for better UX)
    if (isFocused) {
      checkbox.focus();
    }
  }

  function updateProgress() {
    // Query all task checkboxes on the page
    checkboxes = document.querySelectorAll(".task-checkbox");
    
    // Count total tasks
    const totalTasks = checkboxes.length;
    
    // Count how many tasks are completed (checked)
    const completedTasks = [...checkboxes].filter((item) => item.checked).length;
    
    // Calculate percentage: (completed / total) * 100
    const percent = Math.round((completedTasks / totalTasks) * 100);

    // Update progress bar width to match percentage
    progressBar.style.width = `${percent}%`;
    
    // Update the percentage text display
    progressText.textContent = `${percent}% completed`;

    // If all tasks are complete (100%), show celebration popup
    if (completedTasks === totalTasks && totalTasks > 0) {
      modal.classList.remove("hidden");
    }
  }

  function saveSectionData() {
    // Re-query all checkboxes to get current state
    checkboxes = document.querySelectorAll(".task-checkbox");
    
    // Create array of checked/unchecked states for each checkbox
    const checkboxStates = [...checkboxes].map((checkbox) => checkbox.checked);
    
    // Get all dynamic items from the DOM
    const dynamicItems = [];
    document.querySelectorAll(".checkbox-item-wrapper").forEach((wrapper) => {
      const span = wrapper.querySelector("span");
      if (span) {
        dynamicItems.push(span.textContent);
      }
    });

    // Create data object with all user information
    const dataToSave = {
      checkboxes: checkboxStates,        // Array of checkbox states (true/false)
      dynamicItems: dynamicItems,        // Array of user-added task names
      timeSpent: timeSpentInput.value,   // Hours spent on this category
      remarks: remarksInput.value,       // User's thoughts/notes
      goals: goalsInput.value            // Category-specific goals
    };

    // Save data to browser's localStorage (persists across page refreshes)
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
  }
}
