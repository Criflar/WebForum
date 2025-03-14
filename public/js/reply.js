document.addEventListener("DOMContentLoaded", () => {
    const replyForm = document.getElementById("replyForm");
    const parentIdInput = document.getElementById("parentId");

    document.querySelectorAll(".reply-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            const commentId = e.currentTarget.getAttribute("data-comment-id");
            const commentDiv = document.getElementById(`comment-${commentId}`);

            // Move the reply form right under the clicked comment
            commentDiv.appendChild(replyForm);
            replyForm.classList.remove("hidden");
            replyForm.classList.add("reply-active");

            // Set the parent comment ID
            parentIdInput.value = commentId;
            
        });
    });
});
