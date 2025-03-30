document.addEventListener('DOMContentLoaded', function() {
    const emailStep = document.getElementById('emailStep');
    const verificationStep = document.getElementById('verificationStep');
    const emailForm = document.getElementById('emailForm');
    const verificationForm = document.getElementById('verificationForm');
    const verificationInputs = document.querySelectorAll('.verification-code-input');
    const resendCodeLink = document.getElementById('resendCode');

    // Email Form Submission
    emailForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      
      // Simulate sending verification code (replace with actual backend logic)
      console.log(`Verification code sent to ${email}`);
      
      // Switch to verification step
      emailStep.style.display = 'none';
      verificationStep.style.display = 'block';
    });

    // Verification Code Input Handling
    verificationInputs.forEach((input, index) => {
      input.addEventListener('input', function() {
        if (this.value.length === 1) {
          if (index < verificationInputs.length - 1) {
            verificationInputs[index + 1].focus();
          }
        }
      });

      input.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && this.value.length === 0) {
          if (index > 0) {
            verificationInputs[index - 1].focus();
          }
        }
      });
    });

    // Verification Form Submission
    verificationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Collect verification code
      const verificationCode = Array.from(verificationInputs)
        .map(input => input.value)
        .join('');
      
      // Simulate code verification (replace with actual backend logic)
      console.log(`Verifying code: ${verificationCode}`);
      
      // Redirect to login page after successful verification
      window.location.href = 'login.html';
    });

    // Resend Code
    resendCodeLink.addEventListener('click', function(e) {
      e.preventDefault();
      // Simulate resending verification code (replace with actual backend logic)
      console.log('Verification code resent');
      alert('Verification code resent to your email');
    });
  });