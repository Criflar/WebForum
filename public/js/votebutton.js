document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded. Initializing vote buttons.");

  // Select all vote buttons.
  const voteButtons = document.querySelectorAll('.vote-btn');
  voteButtons.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Logged-in users: Proceed with vote toggle.
      const postId = btn.getAttribute('data-post');
      const voteType = btn.getAttribute('data-vote'); // "up" or "down"
      
      if (voteType === 'up') {
        toggleUpvote(postId);
      } else if (voteType === 'down') {
        toggleDownvote(postId);
      }
    });
  });

  // ------------------------
  // Functions for Voting
  // ------------------------

  function toggleUpvote(postId) {
    const upvoteEl = document.getElementById('upvote-' + postId);
    const downvoteEl = document.getElementById('downvote-' + postId);
    const scoreEl = document.getElementById('score-' + postId);
    let currentScore = parseInt(scoreEl.textContent, 10);
    let delta = 0;

    const upvoteImg = upvoteEl.querySelector('img');
    const downvoteImg = downvoteEl.querySelector('img');

    // If upvote is already active, undo it.
    if (upvoteEl.classList.contains('active-vote')) {
      console.log("Undoing upvote for post:", postId);
      upvoteEl.classList.remove('active-vote');
      upvoteImg.src = '/images/upvote.png';
      delta = -1;
    } else {
      // If a downvote is active, remove it.
      if (downvoteEl.classList.contains('active-vote')) {
        console.log("Removing active downvote for post:", postId);
        downvoteEl.classList.remove('active-vote');
        downvoteImg.src = '/images/downvote.png';
        delta += 1; // Removing a downvote adds 1.
      }
      console.log("Adding upvote for post:", postId);
      upvoteEl.classList.add('active-vote');
      upvoteImg.src = '/images/ticked-upvote.png';
      delta += 1;
    }
    updateScore(postId, currentScore, delta, 1);
  }

  function toggleDownvote(postId) {
    const upvoteEl = document.getElementById('upvote-' + postId);
    const downvoteEl = document.getElementById('downvote-' + postId);
    const scoreEl = document.getElementById('score-' + postId);
    let currentScore = parseInt(scoreEl.textContent, 10);
    let delta = 0;

    const upvoteImg = upvoteEl.querySelector('img');
    const downvoteImg = downvoteEl.querySelector('img');

    // If downvote is already active, undo it.
    if (downvoteEl.classList.contains('active-vote')) {
      console.log("Undoing downvote for post:", postId);
      downvoteEl.classList.remove('active-vote');
      downvoteImg.src = '/images/downvote.png';
      // If current score is 0, undoing should not add +1.
      delta = (currentScore === 0) ? 0 : 1;
    } else {
      // If an upvote is active, remove it.
      if (upvoteEl.classList.contains('active-vote')) {
        console.log("Removing active upvote for post:", postId);
        upvoteEl.classList.remove('active-vote');
        upvoteImg.src = '/images/upvote.png';
        delta -= 1;
      }
      // Apply downvote while highlighting the button.
      console.log("Adding downvote for post:", postId);
      downvoteEl.classList.add('active-vote');
      downvoteImg.src = '/images/ticked-downvote.png';
      // When current score is 0, even though the button highlights, no score change.
      delta = (currentScore === 0) ? 0 : -1;
    }
    updateScore(postId, currentScore, delta, -1);
  }

  // ------------------------
  // Update Score Function
  // ------------------------

  // This function updates the score in the UI and sends the vote change to the server.
  function updateScore(postId, currentScore, delta, voteValue) {
    const scoreEl = document.getElementById('score-' + postId);
    // Clamp the new score to a minimum of 0.
    const newScore = Math.max(0, currentScore + delta);
    console.log("Updating score for post:", postId, "Delta:", delta, "Optimistic new score:", newScore);
    scoreEl.textContent = newScore;

    // Send vote change to the server.
    fetch('/posts/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: postId, vote: voteValue })
    })
    .then(response => response.json())
    .then(data => {
      console.log("Server response for post", postId, ":", data);
      // Update the UI with the definitive score from the server.
      scoreEl.textContent = data.newScore;
    })
    .catch(error => {
      console.error("Error updating vote for post", postId, ":", error);
      // If an error occurs, revert the UI back to the original score.
      scoreEl.textContent = currentScore;
    });
  }
});
