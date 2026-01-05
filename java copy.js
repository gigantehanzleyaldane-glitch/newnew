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

    document.getElementById("container").style.display = "none";

    const secondDesign = document.getElementById("second-design");
    secondDesign.textContent = `Welcome, ${username}`;


    showpage("second");
}


function showpage(id) {
    console.log("showpage() called with id:", id);

    const currentP = document.querySelector(".page.active");
    if (currentP) currentP.classList.remove("active");

    const n = document.getElementById(id);
    if (n) {
        setTimeout(() => {
            n.classList.add("active");
            history.pushState({ page: id }, "", `#${id}`);
        }, 20);
    } else {
        console.error("Page not found:", id);
    }
}


window.addEventListener("popstate", (e) => {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

    if (e.state && e.state.page) {
        const target = document.getElementById(e.state.page);
        if (target) target.classList.add("active");
        document.getElementById("container").style.display = "none";
    } else {
        document.getElementById("container").style.display = "block";
    }
});



window.addEventListener("DOMContentLoaded", () => {
    const hash = window.location.hash.substring(1);
    if (hash) showpage(hash);
});


async function addquestion() {
    const qText = document.getElementById("teacher-question").value;

    const choices = [
        document.getElementById("teacher-option-0").value,
        document.getElementById("teacher-option-1").value,
        document.getElementById("teacher-option-2").value,
        document.getElementById("teacher-option-3").value,
    ];

    const correct = document.querySelector("input[name=option]:checked");

    if (!qText || choices.some(c => !c) || !correct) {
        alert("Please fill all fields and select the correct answer.");
        return;
    }

    question.push({
        question: qText,
        choice: choices,
        answer: parseInt(correct.value)
    });

    alert(`Question added! Total questions: ${question.length}`);

    document.getElementById("teacher-question").value = "";
    choices.forEach((_, i) => document.getElementById(`teacher-option-${i}`).value = "");
    correct.checked = false;
}


async function saveQuiz() {
    const quizCode = document.getElementById("quiz-code").value;

    if (!quizCode || question.length === 0) {
        alert("Quiz code and at least one question required");
        return;
    }

    const { error } = await supabase.from("Onato").insert({
        code: quizCode,
        questions: question,
        name: username
    });

    if (error) {
        alert(error.message);
    } else {
        alert("Quiz saved successfully!");
    }
}


async function joinRoom() {
    const roomCode = document.getElementById("student-type-code").value;

    if (!roomCode) {
        alert("Enter room code");
        return;
    }

    const { data, error } = await supabase
        .from("Onato")
        .select("questions")
        .eq("code", roomCode)
        .single();

    if (error || !data) {
        alert("Quiz not found");
        return;
    }

    question = data.questions;
    currentQuizCode = roomCode;
    score = 0;
    current = 0;

    showpage("Quiz-area");
    Showquiz();
}


function Showquiz() {
    if (current >= question.length) {
        saveScore();

        document.getElementById("Quiz-area").innerHTML = `
            <div style="text-align:center; padding: 20px; margin-top: 250px; font-size: 24px; color: Black; font-family: tahoma;">
                <h2>Quiz Finished</h2>
                <p>${username}, your score: ${score}/${question.length}</p>
            </div>
        `;
        return;
    }

    const q = question[current];
    let html = `<div class="quizbox"><h3>${q.question}</h3>`;

    q.choice.forEach((c, i) => {
        html += `<button class="choicebtn" onclick="checking(${i})">${c}</button><br>`;
    });

    html += `</div>`;
    document.getElementById("Quiz-area").innerHTML = html;
}


function checking(selected) {
    if (selected === question[current].answer) score++;
    current++;
    Showquiz();
}

async function saveScore() {
    await supabase
        .from("Onato")
        .update({ QuizResult: score })
        .eq("code", currentQuizCode);
}

/* ---------------- EXPORT TO WINDOW ---------------- */
window.firstbutton = firstbutton;
window.showpage = showpage;
window.addquestion = addquestion;
window.saveQuiz = saveQuiz;
window.joinRoom = joinRoom;
window.checking = checking;
