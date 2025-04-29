export function checkAnswer(answer, correctAnswer, quizOptions, resultId, containerId) {
    const resultText = document.getElementById(resultId);
    const quizContainer = document.getElementById(containerId);

    if (!resultText || !quizContainer) {
        console.error(`Missing element: resultId=${resultId} or containerId=${containerId}`);
        return;
    }

    // Get only the buttons within this quiz container
    const buttons = quizContainer.querySelectorAll(".quiz-btn");

    // Reset styles for these buttons
    buttons.forEach(button => {
        button.style.backgroundColor = "#007bff"; // default blue
        button.style.color = "white";
        button.disabled = false;
    });

    if (answer === correctAnswer) {
        resultText.innerHTML = `<span class="correct-msg">✅ Correct! ${quizOptions[answer]}</span>`;
        quizContainer.querySelector(`button[data-option="${answer}"]`).style.backgroundColor = "green";
    } else {
        resultText.innerHTML = `<span class="incorrect-msg">❌ Incorrect. The correct answer is <strong>${correctAnswer}) ${quizOptions[correctAnswer]}</strong></span>`;
        quizContainer.querySelector(`button[data-option="${answer}"]`).style.backgroundColor = "red";
        quizContainer.querySelector(`button[data-option="${correctAnswer}"]`).style.backgroundColor = "green";
    }

    // Disable buttons in this quiz only
    buttons.forEach(button => button.disabled = true);
}

export default function GraphQuizComponent(problemStatement, graphTitle, graphDescription, quizQuestion, quizOptions, correctAnswer) {
    // Sanitize the graphTitle to generate unique IDs (remove non-alphanumerics)
    const sanitizedTitle = graphTitle.replace(/[^a-zA-Z0-9]/g, '');
    const containerId = `quiz-container-${sanitizedTitle}`;
    const resultId = `quiz-result-${sanitizedTitle}`;

    return `
        <div class="graph-quiz-container" id="${containerId}">
            <div class="problem-statement">
                <h2>Key Insights: ${problemStatement}</h2>
            </div>
            
            <div class="quiz-section">
                <h3>Research question: ${quizQuestion}</h3>
                <div class="quiz-options">
                    ${Object.keys(quizOptions).map(option => `
                        <button class="quiz-btn" data-option="${option}"
                            data-container="${containerId}" data-result="${resultId}">
                            ${option}) ${quizOptions[option]}
                        </button>
                    `).join('')}
                </div>
                <p id="${resultId}"></p>
            </div>
            
            <div class="graph-section">
                <h2>${graphTitle}</h2>
                <p class="graph-description">${graphDescription}</p>
                <div id="${sanitizedTitle}"></div>
            </div>
        </div>
    `;
}