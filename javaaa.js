console.log("RUN");

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://yrypvjywiwjxcqdofwta.supabase.co";
const supabaseKey = "sb_publishable_cBCBvmcNfUiXatltBOTciQ_IzVeMFXu";
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Supabase connected:", supabase);
alert("JavaScript loaded successfully!");

let username = "";
let question = [];
let score = 0;
let current = 0;
let currentQuizCode = "";

function firstbutton() {
    console.log("firstbutton() called");
    username = document.getElementById("input").value.trim();
    console.log("Username:", username);

    if (username === "") {
        alert("Invalid Username");
        return;
    }

    let secondDesign = document.getElementById("second-design");
    secondDesign.textContent = `Welcome, ${username}`;

    showpage("second");
    alert("Welcome screen loaded!");
}

function showpage(id) {
    console.log("showpage() called with id:", id);

    let currentP = document.querySelector(".page.active");
    if (currentP) {
        currentP.classList.remove("active");
        console.log("Removed active class from:", currentP.id);
    }

    let n = document.getElementById(id);
    if (n) {
        setTimeout(() => {
            n.classList.add("active");
            console.log("Added active class to:", id);

            history.pushState({ page: id }, "", `#${id}`);
        }, 20);
    } else {
        console.error("Page not found:", id);
    }
}

// Handle back/forward button clicks
window.addEventListener("popstate", (e) => {
    console.log("popstate event triggered", e.state);

    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));

    if (e.state && e.state.page) {
        let targetPage = document.getElementById(e.state.page);
        if (targetPage) {
            setTimeout(() => {
                targetPage.classList.add("active");
                console.log("Restored page:", e.state.page);
            }, 20);
        }
    }
});

// Set initial state
window.addEventListener("DOMContentLoaded", () => {
    let hash = window.location.hash.substring(1);
    if (hash) {
        showpage(hash);
    } else {
        history.replaceState({ page: "container" }, "", "#container");
    }
});

async function addquestion() {
    console.log("addquestion() called");

    let a = document.getElementById("teacher-question").value.trim();
    let choices = [
        document.getElementById("teacher-option-0").value.trim(),
        document.getElementById("teacher-option-1").value.trim(),
        document.getElementById("teacher-option-2").value.trim(),
        document.getElementById("teacher-option-3").value.trim(),
    ];
    let correct = document.querySelector("input[name=option]:checked");

    console.log("Question:", a);
    console.log("Choices:", choices);
    console.log("Correct answer:", correct ? correct.value : "none selected");

    if (!a || choices.some((c) => !c) || !correct) {
        alert("Please fill all fields and select the correct answer.");
        return;
    }

    question.push({
        question: a,
        choice: choices,
        answer: parseInt(correct.value),
    });

    document.getElementById("teacher-question").value = "";
    document.getElementById("teacher-option-0").value = "";
    document.getElementById("teacher-option-1").value = "";
    document.getElementById("teacher-option-2").value = "";
    document.getElementById("teacher-option-3").value = "";
    correct.checked = false;

    alert(`Question added! Total questions: ${question.length}`);
    console.log("All questions:", question);
}

async function saveQuiz() {
    console.log("saveQuiz() called");
    const quizCode = document.getElementById("quiz-code").value.trim();
    console.log("Quiz code:", quizCode);

    if (!quizCode) {
        alert("Enter a quiz code");
        return;
    }
    if (question.length === 0) {
        alert("Add at least one question");
        return;
    }

    try {
        const { data, error } = await supabase
            .from("Onato")
            .insert({ code: quizCode, questions: question, name: username });

        if (error) {
            console.error("Supabase error:", error);
            alert("Error saving quiz: " + error.message);
        } else {
            alert("Quiz saved! Code: " + quizCode);
        }
    } catch (err) {
        console.error("Unexpected error:", err);
        alert("Unexpected error: " + err.message);
    }
}

async function joinRoom() {
    const roomCode = document.getElementById("student-type-code").value.trim();
    if (!roomCode) {
        alert("Please enter a room code");
        return;
    }

    try {
        const { data, error } = await supabase
            .from("Onato")
            .select("questions")
            .eq("code", roomCode)
            .single();

        if (error || !data) {
            alert("Quiz not found! " + (error ? error.message : ""));
            return;
        }

        question = data.questions;
        currentQuizCode = roomCode;
        score = 0;
        current = 0;

        showpage("Quiz-area");
        Showquiz();
    } catch (err) {
        console.error("Unexpected error:", err);
        alert("Unexpected error: " + err.message);
    }
}

function start() {
    if (question.length === 0) {
        alert("Please add questions first!");
        return;
    }
    score = 0;
    current = 0;
    showpage("Quiz-area");
    Showquiz();
}

async function saveScore() {
    try {
        const { error: updateError } = await supabase
            .from("Onato")
            .update({ QuizResult: score })
            .eq("code", currentQuizCode);

        if (updateError) {
            alert("Score couldn't be saved: " + updateError.message);
        }
    } catch (err) {
        alert("Unexpected error: " + err.message);
    }
}

function Showquiz() {
    if (current >= question.length) {
        saveScore();
       const quizArea = document.getElementById("Quiz-area");

quizArea.style.display = "block";
quizArea.innerHTML = `
    <div id="quizscore" class="onat">
        <h1>Quiz Finished!</h1>
        <p><strong>${username}</strong>, your score: ${score}/${question.length}</p>
        <p style="font-size:35px; color:green; margin-top:20px;">✅ Score saved to database!</p>
    </div>
        `;
        alert(`Quiz finished! Your score: ${score}/${question.length}`);
        return;
    }

    let q = question[current];
    let otano = `<div class="quizbox"><h3>${q.question}</h3>`;
    q.choice.forEach((el, i) => {
        otano += `<button class="choicebtn" onclick="checking(${i})">${el}</button><br>`;
    });
    otano += `</div>`;
    document.getElementById("Quiz-area").style.display = "block";
    document.getElementById("Quiz-area").innerHTML = otano;
}

function checking(selected) {
    if (selected === question[current].answer) score++;
    current++;
    Showquiz();
}

// Expose functions to window
window.firstbutton = firstbutton;
window.showpage = showpage;
window.addquestion = addquestion;
window.saveQuiz = saveQuiz;
window.joinRoom = joinRoom;
window.start = start;
window.checking = checking;

console.log("All functions loaded to window object");
