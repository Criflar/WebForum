document.addEventListener('DOMContentLoaded', function () {
  console.log("DOM fully loaded. Initializing vote buttons.");

  document.querySelectorAll('.vote-btn, .vote-btn-comment').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
          e.preventDefault();
          
          const isPost = btn.classList.contains('vote-btn');  // Vote is either for post or comment
          const id = btn.getAttribute(isPost ? 'data-post' : 'data-comment');
          const voteType = btn.getAttribute('data-vote'); // "up" or "down"

          if (voteType === 'up') {
              toggleUpvote(id, isPost);
          } else if (voteType === 'down') {
              toggleDownvote(id, isPost);
          }
      });
  });
});


// Changes upvote button and updates score
function toggleUpvote(id, isPost) {
  const upvoteEl = document.getElementById('upvote-' + id);
  const downvoteEl = document.getElementById('downvote-' + id);
  const upvoteImg = upvoteEl.querySelector('img');
  const downvoteImg = downvoteEl.querySelector('img');

  let voteValue = 1;

  if (upvoteEl.classList.contains('active-vote')) {
      upvoteEl.classList.remove('active-vote');
      upvoteImg.src = '/images/Upvote.png';
      voteValue = null;
  } else {
      upvoteEl.classList.add('active-vote');
      upvoteImg.src = '/images/TickedUpvote.png';
      downvoteImg.src = '/images/Downvote.png';

      if (downvoteEl.classList.contains('active-vote')) {
          downvoteEl.classList.remove('active-vote');
          downvoteImg.src = '/images/Downvote.png';
      }
  }

  updateScore(id, voteValue, isPost);
}

// Changes downvote button and updates score
function toggleDownvote(id, isPost) {
  const upvoteEl = document.getElementById('upvote-' + id);
  const downvoteEl = document.getElementById('downvote-' + id);
  const upvoteImg = upvoteEl.querySelector('img');
  const downvoteImg = downvoteEl.querySelector('img');

  let voteValue = -1;

  if (downvoteEl.classList.contains('active-vote')) {
      downvoteEl.classList.remove('active-vote');
      downvoteImg.src = '/images/Downvote.png';
      voteValue = null;
  } else {
      downvoteEl.classList.add('active-vote');
      downvoteImg.src = '/images/TickedDownvote.png';
      upvoteImg.src = '/images/Upvote.png';

      if (upvoteEl.classList.contains('active-vote')) {
          upvoteEl.classList.remove('active-vote');
          upvoteImg.src = '/images/Upvote.png';
      }
  }

  updateScore(id, voteValue, isPost);
}


// Updates the score via fetch
function updateScore(id, voteValue, isPost) {
  const scoreEl = document.getElementById('score-' + id);
  const url = isPost ? '/posts/vote' : '/comments/vote';

  console.log(`Updating score for ${isPost ? "post" : "comment"}:`, id);

  fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [isPost ? 'postId' : 'commentId']: id, vote: voteValue })
  })
  .then(response => response.json())
  .then(data => {
      console.log(`Server response for ${isPost ? "post" : "comment"}:`, data);
      if (data.newScore !== undefined) {
          scoreEl.textContent = data.newScore;
      }
  })
  .catch(error => {
      console.error(`Error updating vote for ${isPost ? "post" : "comment"}:`, error);
  });
}
