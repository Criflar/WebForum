document.addEventListener("DOMContentLoaded", () => {
    const replyForm = document.getElementById("replyForm");
    const parentIdInput = document.getElementById("parentId");

    document.querySelectorAll(".reply-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            const commentId = e.currentTarget.getAttribute("data-comment-id");
            const commentDiv = document.getElementById(`comment-${commentId}`);
            const replyContainer = commentDiv.querySelector(".reply2-item"); // Find the replies container

            if (!replyContainer) {
                console.error(`Reply container not found for comment: ${commentId}`);
                return;
            }

            // Move the reply form AFTER the .reply2-item div
            replyContainer.after(replyForm);
            replyForm.classList.remove("hidden");
            replyForm.classList.add("reply-active");

            // Set the parent comment ID
            parentIdInput.value = commentId;
        });
    });
});
