(() => {
  const form = document.getElementById('datorvana-quiz');
  if (!form) return;
  const answers = [{"correct": 0, "explanation": "Klicka med två fingrar för att öppna snabbmenyn.", "target": "bild-3"}, {"correct": 1, "explanation": "CMD + tab växlar mellan appar som Finder och Chrome.", "target": "bild-4"}, {"correct": 2, "explanation": "Filnamnet beskriver uppgiften och innehåller ett årtal.", "target": "bild-5"}, {"correct": 0, "explanation": "Övningen låter dig skapa ämnesmappar både på datorn och i Drive.", "target": "bild-6"}, {"correct": 1, "explanation": "Mejlen hjälper dig att hålla koll på delningar, uppgifter och kommentarer.", "target": "bild-7"}, {"correct": 2, "explanation": "Att skapa och skriva dokumentet räcker inte: uppgiften ska lämnas in.", "target": "bild-9"}, {"correct": 0, "explanation": "Kalendern måste vara vald för att uppgifterna ska visas.", "target": "bild-10"}, {"correct": 1, "explanation": "CMD + C kopierar och CMD + V klistrar in.", "target": "bild-12"}, {"correct": 2, "explanation": "Citattecken används för att söka efter en sammanhängande fras.", "target": "bild-14"}, {"correct": 0, "explanation": "Presentationens råd är att även titta på Wikipedias källor.", "target": "bild-14"}];
  const result = document.getElementById('datorvana-result');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const values = new FormData(form);
    if (answers.some((_,i) => !values.has(`q${i}`))) {
      result.textContent = 'Svara på alla tio frågor innan du rättar quizet.';
      return;
    }
    let score = 0;
    const feedback = answers.map((answer,i) => {
      const correct = Number(values.get(`q${i}`)) === answer.correct;
      if (correct) score++;
      return `<li><strong>Fråga ${i+1}: ${correct ? 'Rätt' : 'Repetera'}.</strong> ${answer.explanation} ${correct ? '' : `<a href="#${answer.target}">Läs avsnittet igen</a>`}</li>`;
    });
    result.innerHTML = `<div class="quiz-feedback"><h3>${score} av 10 rätt</h3><ol>${feedback.join('')}</ol><p>${score === 10 ? 'Gör gärna quizet igen om några dagar utan stöd.' : 'Repetera avsnitten som länkas ovan och försök sedan igen.'}</p></div>`;
    result.focus();
  });
  form.addEventListener('reset', () => { result.textContent = ''; });
})();
