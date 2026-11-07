const expenseForm = document.getElementById("expenseForm");

const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const expenseDate = document.getElementById("expenseDate");

const expenseList = document.getElementById("expenseList");
const totalExpenses = document.getElementById("totalExpenses");

// Set today's date automatically
expenseDate.value = new Date().toISOString().split("T")[0];

// Load expenses when the page opens
window.addEventListener("load", loadExpenses);

// Add a new expense
expenseForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = expenseName.value.trim();
    const amount = Number(expenseAmount.value);
    const category = expenseCategory.value;
    const date = expenseDate.value;

    // Validate form
    if (name === "" || amount <= 0 || category === "" || date === "") {
        alert("Please enter all expense details correctly!");
        return;
    }

    const expense = {
        name: name,
        amount: amount,
        category: category,
        date: date
    };

    try {
        const response = await fetch("/expenses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(expense)
        });

        if (!response.ok) {
            throw new Error("Unable to save expense");
        }

        expenseForm.reset();
        expenseDate.value = new Date().toISOString().split("T")[0];

        loadExpenses();

    } catch (error) {
        alert("Could not save expense. Please try again.");
        console.log(error);
    }
});

// Display expenses
async function loadExpenses() {
    try {
        const response = await fetch("/expenses");
        const expenses = await response.json();

        expenseList.innerHTML = "";

        let total = 0;

        expenses.forEach(function(expense) {
            total += expense.amount;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${escapeHTML(expense.name)}</td>
                <td>₹${expense.amount.toFixed(2)}</td>
                <td>${escapeHTML(expense.category)}</td>
                <td>${escapeHTML(expense.date)}</td>
                <td>
                    <button onclick="deleteExpense('${expense._id}')">
                        Delete
                    </button>
                </td>
            `;

            expenseList.appendChild(row);
        });

        totalExpenses.textContent = "₹" + total.toFixed(2);

    } catch (error) {
        console.log("Error loading expenses:", error);
    }
}

// Delete an expense
async function deleteExpense(id) {
    const confirmDelete = confirm("Do you want to delete this expense?");

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch("/expenses/" + id, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Unable to delete expense");
        }

        loadExpenses();

    } catch (error) {
        alert("Could not delete expense.");
        console.log(error);
    }
}

// Prevent HTML from being inserted as expense text
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function(character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}