// =====================
// FAQ Accordion Toggle
// =====================
const faqQuestions = document.querySelectorAll('.faq__question');

faqQuestions.forEach((question) => {
  question.addEventListener('click', () => {
    const answer = question.nextElementSibling;
    const icon   = question.querySelector('.faq__icon');

    // Close all other open answers
    document.querySelectorAll('.faq__answer').forEach((otherAnswer) => {
      if (otherAnswer !== answer) {
        otherAnswer.classList.remove('active');
        otherAnswer.previousElementSibling
          .querySelector('.faq__icon').textContent = '+';
      }
    });

    // Toggle current answer
    answer.classList.toggle('active');
    icon.textContent = answer.classList.contains('active') ? '×' : '+';
  });
});

//