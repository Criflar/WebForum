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
});

  // ------------------------
  // Functions for Voting
  // ------------------------

// Manages UI elements when upvoting. (Toggle vote buttons, etc.)
function toggleUpvote(postId) {
  const upvoteEl = document.getElementById('upvote-' + postId);
  const downvoteEl = document.getElementById('downvote-' + postId);

  const upvoteImg = upvoteEl.querySelector('img');
  const downvoteImg = downvoteEl.querySelector('img');

  let voteValue = 1;  // Default to upvote

  if (upvoteEl.classList.contains('active-vote')) {
      // Undo upvote
      upvoteEl.classList.remove('active-vote');
      upvoteImg.src = '/images/upvote.png';
      voteValue = null;  // null value = delete vote
  } else {
      // Apply upvote
      upvoteEl.classList.add('active-vote');
      upvoteImg.src = '/images/ticked-upvote.png';
      downvoteImg.src = '/images/downvote.png';

      // If a downvote was active, remove it
      if (downvoteEl.classList.contains('active-vote')) {
          downvoteEl.classList.remove('active-vote');
          downvoteImg.src = '/images/downvote.png';
      }
  }

  // Fetch the correct score from the backend
  updateScore(postId, voteValue);
}

// Manages UI elements when downvoting. (Toggle vote buttons, etc.)
function toggleDownvote(postId) {
  const upvoteEl = document.getElementById('upvote-' + postId);
  const downvoteEl = document.getElementById('downvote-' + postId);

  const upvoteImg = upvoteEl.querySelector('img');
  const downvoteImg = downvoteEl.querySelector('img');

  let voteValue = -1;  // Default to downvote

  if (downvoteEl.classList.contains('active-vote')) {
      // Undo downvote
      downvoteEl.classList.remove('active-vote');
      downvoteImg.src = '/images/downvote.png';
      voteValue = null;  // null value = delete vote
  } else {
      // Apply downvote
      downvoteEl.classList.add('active-vote');
      downvoteImg.src = '/images/ticked-downvote.png';
      upvoteImg.src = '/images/upvote.png';

      // If an upvote was active, remove it
      if (upvoteEl.classList.contains('active-vote')) {
          upvoteEl.classList.remove('active-vote');
          upvoteImg.src = '/images/upvote.png';
      }
  }

  // Fetch the correct score from the backend
  updateScore(postId, voteValue);
}


// ------------------------
// Update Score Function
// ------------------------

// This function updates the score in the server, then updates it in the UI.
function updateScore(postId, voteValue) {
  const scoreEl = document.getElementById('score-' + postId);
  
  console.log("Updating score for post", postId);


  // Send vote change to the server.
  fetch('/posts/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId: postId, vote: voteValue })
  })
  .then(response => response.json())
  .then(data => {
    console.log("Server response for post", postId, ":", data);
    
    if (data.newScore !== undefined) {
      scoreEl.textContent = data.newScore;  // Update the UI from the server
    }
  })
  .catch(error => {
    console.error("Error updating vote for post", postId, ":", error);
  });
}
