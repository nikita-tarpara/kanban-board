// -------------------- DOM ELEMENTS -------------------- 
 
const addBtn = document.querySelector(".add-btn"); 
const removeBtn = document.querySelector(".remove-btn"); 
const modalCont = document.querySelector(".modal-cont"); 
const textAreaCont = document.querySelector(".textArea-cont"); 
const mainCont = document.querySelector(".main-cont"); 
const allPriorityColors = document.querySelectorAll(".priority-color");
const selectFilterColors = document.querySelectorAll(".color");
const lockClose = "fa-lock";
const lockOpen = "fa-unlock";
const colors = ["lightpink", "lightgreen", "lightblue", "black"];
let ticketsArr = [];
 
// -------------------- STATE FLAGS -------------------- 
 
let addTaskFlag = false; // Tracks whether modal is open or closed 
let removeTaskFlag = false; // Tracks whether delete mode is active 

// ---------------------- CHECK TICKETS ----------------------

// Check if previous tickets exist in localStorage 
if (localStorage.getItem("tickets")) { 
    ticketsArr = JSON.parse(localStorage.getItem("tickets")); 
    // Rebuild the UI from saved data 
    for (let i = 0; i < ticketsArr.length; i++) { 
        const { ticketColor, ticketID, ticketTask } = ticketsArr[i]; 
        createTicket(ticketColor, ticketID, ticketTask); 
    } 
}
 
// -------------------- EVENT LISTENERS -------------------- 
 
// Toggle Modal Pop-up 
/* The addTaskFlag acts like a simple ON/OFF switch. Every click on the (+) button flips the flag (true ↔ false). When true → the modal appears (display: flex). When false → the modal hides (display: none). */ 
addBtn.addEventListener("click", function () { 
    // Flip the flag value each time the (+) button is clicked 
    addTaskFlag = !addTaskFlag; 
    
    // Show or hide the modal based on the flag 
    modalCont.style.display = addTaskFlag ? 'flex' : 'none';  
});

// Toggle Delete Button Color 
removeBtn.addEventListener("click", function () { 
    removeTaskFlag = !removeTaskFlag; 
    
    if (removeTaskFlag) { 
        alert("Delete mode activated!"); 
        removeBtn.style.color = "red"; 
    } else { 
        removeBtn.style.color = "white"; 
    } 
}); 

// selection of color in popup
allPriorityColors.forEach(color => {
    color.addEventListener("click", function() {

        // remove active from all
        allPriorityColors.forEach(c => {
            c.classList.remove("active");
        });

        // add active to clicked color
        color.classList.add("active");
    });
});

// If the Shift key is pressed, we’ll call createTicket(), close the modal, and clear the text area. 
modalCont.addEventListener("keydown", function (e) { 
    const keyPressed = e.key; 
    
    if (keyPressed === "Shift") { 
        const taskContent = textAreaCont.value.trim(); // Read the text from textarea 
        if (taskContent === "") { 
            alert("Please enter a task before creating a ticket."); 
            return; 
        }

        // Generate a unique ID using the shortid library 
        // const ticketID = shortid(); 

        // get selected color
        const selectedColorElement = document.querySelector(".priority-color.active");
        const selectedColor = selectedColorElement.classList[0];

        addNewTicket(selectedColor, taskContent); // Call the addNewTicket function to generate a new ticket
        // createTicket(selectedColor, ticketID, taskContent); // Call the createTicket function to generate a new ticket 

        modalCont.style.display = "none"; // Hide the modal after creating the ticket 
        addTaskFlag = false; // Reset modal flag to closed 
        textAreaCont.value = ""; // Clear text area for next input 
    } 
});

// Handle filter
selectFilterColors.forEach(filterColor => {
    // listening click event on each color box
    filterColor.addEventListener("click", function(e) {
        // get color name to filter
        const color = e.target.classList[0];

        // fetch all tickets
        const allTickets = document.querySelectorAll(".ticket-cont");

        // iterate through each ticket and check color of every ticket
        allTickets.forEach(ticket => {

            // compare ticket color with selected color for filter
            if (ticket.classList.contains(color)) {
                ticket.style.display = "block";
            } else {
                ticket.style.display = "none";
            }
        });
    });

    // reset filter
    filterColor.addEventListener("dblclick", function() {
        const allTickets = document.querySelectorAll(".ticket-cont");
        for (let k = 0; k < allTickets.length; k++) { 
            allTickets[k].style.display = "block"; 
        } 
    });
});


// -------------------- FUNCTIONS -------------------- 

function addNewTicket(ticketColor, ticketTask) { 
    const id = shortid(); 
    ticketsArr.push({ ticketColor, ticketTask, ticketID: id }); 
    localStorage.setItem("tickets", JSON.stringify(ticketsArr)); 
    createTicket(ticketColor, id, ticketTask); 
} 

// The purpose of this function is to create a new "ticket" dynamically 
// and add it inside the main container whenever it is called. 
 
function createTicket(selectedColor, ticketID, ticketTask) { 
    // Create a new div element for the ticket 
    const ticketCont = document.createElement('div'); 
    
    // Assign the class 'ticket-cont' to it for styling 
    ticketCont.setAttribute('class', `ticket-cont ${selectedColor}`);
    ticketCont.setAttribute('data-color', `${selectedColor}`); 
    
    // Add inner structure to the ticket 
    ticketCont.innerHTML = ` 
        <div class="ticket-color"></div>
        <div class="ticket-header">
            <h3 class="ticket-id">${ticketID}</h3> 
            <div class="ticket-lock"> 
                <i class="fa-solid fa-lock"></i> 
            </div>
        </div>
        <div class="task-area">${ticketTask}</div> 
    `; 
    
    // Append the created ticket to the main container 
    mainCont.appendChild(ticketCont); 

    // Add delete functionality (will activate only when delete mode is on) 
    handleRemoval(ticketCont, ticketID); 

    // handle lock to edit/update functionality
    handleLock(ticketCont, ticketID);

    // handle ticket status
    handleTicketStatus(ticketCont, ticketID);
}

// Function to remove tickets when delete mode is active 
function handleRemoval(ticket, ticketID) { 
    ticket.addEventListener("click", function () { 
        if (!removeTaskFlag) return; 
        ticket.remove(); 
        let idx = getTicketIndex(ticketID); 
        // 3. Remove it from ticketsArr 
        ticketsArr.splice(idx, 1); 
        // 4. Save updated array to localStorage 
        localStorage.setItem("tickets", JSON.stringify(ticketsArr));  
    }); 
} 

function handleLock(ticket, ticketID) {
    const ticketLock = ticket.querySelector(".ticket-lock");
    const taskArea = ticket.querySelector(".task-area");

    ticketLock.addEventListener("click", function(e) {
        console.log("Ready to use update functionality");
        let index = getTicketIndex(ticketID); 
        const icon = ticketLock.children[0];
        if (icon.classList.contains(lockClose)) {
            // change icon
            icon.classList.remove(lockClose);
            icon.classList.add(lockOpen);

            // make task area editable
            // taskArea.setAttribute("contenteditable", "true");
            taskArea.contentEditable = true;
            taskArea.focus();
        } else {
            // change icon
            icon.classList.remove(lockOpen);
            icon.classList.add(lockClose);

            // make task area non editable
            taskArea.contentEditable = false;
        }

        ticketsArr[index].ticketTask = taskArea.innerText; 
        localStorage.setItem("tickets", JSON.stringify(ticketsArr)); 

    });
}

function handleTicketStatus(ticket, ticketID) {
    const colorBand = ticket.querySelector(".ticket-color");

    colorBand.addEventListener("click", function() {
        const currentColor = ticket.getAttribute("data-color");
        let currenColorIdx = colors.findIndex(function(color) {
            return currentColor == color
        })

        let nextColorIdx = (currenColorIdx + 1) % colors.length;
        if (ticket.classList.contains(currentColor)) {
            ticket.classList.remove(currentColor);
            ticket.classList.add(colors[nextColorIdx]);
            ticket.setAttribute("data-color", `${colors[nextColorIdx]}`);
        }
         let index = getTicketIndex(ticketID); 
        ticketsArr[index].ticketColor = colors[nextColorIdx]; 
        localStorage.setItem("tickets", JSON.stringify(ticketsArr)); 
    });
}

function getTicketIndex(id) { 
    for (let i = 0; i < ticketsArr.length; i++) { 
        if (ticketsArr[i].ticketID === id) { 
            return i; 
        } 
    } 
    return -1; 
} 