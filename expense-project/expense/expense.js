const form = document.getElementById("expense");

const descData = document.getElementById("description");

const amount = document.getElementById("amount");

const category = document.getElementById("selectItem");

const error = document.getElementById("error");

const razorPay = document.getElementById("razor-pay");

const premium = document.getElementById("premium-member");

const leaderBoard = document.getElementById("leader-board");

const element = document.getElementById("leader-list");

const lead = document.getElementById("lead");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let expense = {
        description: descData.value,
        category: category.value,
        amount: amount.value,
    };
    try {
        const token = await localStorage.getItem("token")
        const expenseDetail = await axios.post("http://localhost:3000/expense/addExpense", expense, { headers: { "Authorization": token } });
        console.log(expenseDetail);
        ShowValue(expenseDetail.data.expenseData)

    } catch (err) {
        showError(err);
    }
});

let isLeaderboardOpen = false;

leaderBoard.onclick = async () => {
    try {
        const token = localStorage.getItem("token")
        if (!isLeaderboardOpen) {
            const result = await axios.get("http://localhost:3000/premium/showleaderboard", { headers: { "Authorization": token } });
            console.log(result);
            if (result.data.isPremium == true) {
                for (let i = 0; i < result.data.leaderboard.length; i++) {
                    showLeaderboard(result.data.leaderboard[i]);
                }
            }
            else {
                for (let i = 0; i < result.data.leaderboard.length; i++) {
                    showLeaderboard(result.data.leaderboard[i]);
                }
            }
            isLeaderboardOpen = true;
        }
        else {
            element.innerHTML = "";
            isLeaderboardOpen = false;
        }
    } catch (err) {
        showError(err);
    }
}

function showLeaderboard(lead) {
    const subElement = document.createElement("li");
    if(lead.total==undefined){
        lead.total = 0;
    }
    subElement.textContent = `Name: ${lead.name} - Expense amount: ${lead.total}`;

    element.appendChild(subElement);

}

window.addEventListener("DOMContentLoaded", async () => {
    try {
        const token = localStorage.getItem("token")
        const all = await axios.get("http://localhost:3000/expense/getExpense", { headers: { "Authorization": token } });
        console.log(all);
        if (all.data.isPremium == true) {
            razorPay.style.display = "none";
            premium.style.display = "block";
            lead.style.display = "block";
            for (let i = 0; i < all.data.allExpense.length; i++) {
                ShowValue(all.data.allExpense[i]);
            }
        }
        else {
            for (let i = 0; i < all.data.allExpense.length; i++) {
                ShowValue(all.data.allExpense[i]);
            }
        }
    } catch (err) {
        showError(err);
    }
});

function ShowValue(expenseVal) {

    const element = document.getElementById("list");
    const subElement = document.createElement("li");

    subElement.textContent = `Description: ${expenseVal.description} - Expense amount: ${expenseVal.amount} - Category: ${expenseVal.category}`;

    const deleteBtn = document.createElement("input");
    deleteBtn.type = "button";
    deleteBtn.value = "Delete";

    deleteBtn.onclick = () => {
        element.removeChild(subElement)
        Delete(expenseVal);
    };

    subElement.appendChild(deleteBtn);
    element.appendChild(subElement);
}

async function Delete(v) {
    try {
        const token = await localStorage.getItem("token")
        await axios.delete(`http://localhost:3000/expense/${v.id}`, { headers: { "Authorization": token } })
    } catch (err) {
        showError(err);
    }
}

razorPay.onclick = async (e) => {

    const token = localStorage.getItem('token');
    const result = await axios.get("http://localhost:3000/purchase/premium", { headers: { "Authorization": token } });
    console.log(result);

    let options = {
        "key": result.data.key_id,
        "order_id": result.data.order.id,
        "handler": async function (response) {
            await axios.post("http://localhost:3000/purchase/updatetransactionstatus", {
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id
            }, { headers: { "Authorization": token } })
            localStorage.setItem("isPremium", true);
            razorPay.style.display = "none";
            premium.style.display = "block";
            lead.style.display = "block";

            alert("You are a premium member now");
        }
    }
    const rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();
    rzp1.on("payment.failed", async function (response) {
        console.log(response);
        await axios.post("http://localhost:3000/purchase/updatetransactionstatus", {
            order_id: options.order_id,
            payment_id: null
        },
            { headers: { "Authorization": token } })
        alert("something went wrong");
    })
}

function showError(err) {
    console.log(err);
    if (err.response !== undefined) {
        error.textContent = `Error: ${err.response.data.Error}`;
    } else {
        error.textContent = `Error: ${err.message}`;
    }
}