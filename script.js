document.addEventListener("DOMContentLoaded", function() {
    // Contact Form Validation
    const contactForm = document.querySelector(".form-container form");

    if (contactForm) {
        contactForm.addEventListener("submit", function(event) {
            const name = document.getElementById("Name").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const date = document.getElementById("date").value.trim();
            const time = document.getElementById("time").value.trim();
            const message = document.getElementById("message").value.trim();

            if (!name || !email || !phone || !date || !time || !message) {
                event.preventDefault();
                alert("Please fill out all fields.");
            }
        });
    }

    // Review Form Submission
    
    document.getElementById('review-form').addEventListener('submit', function(event) {
      event.preventDefault();

      const name = event.target.name.value;
      const review = event.target.review.value;
      const rating = event.target.rating.value;

      const reviewElement = document.createElement('div');
      reviewElement.innerHTML = `
        <h3 class="review">${name}</h3>
        <p class="rating">${rating}</p>
        <p>${review}</p>
      `;

      document.querySelector('.container').appendChild(reviewElement);
      event.target.reset();
    });
  
     

    // Footer Year Update
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
