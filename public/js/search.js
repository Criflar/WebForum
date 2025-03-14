document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search-input");

    searchInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            const query = searchInput.value.trim();

            if (!query) {
                alert("Please enter a search term.");
                return;
            }

            // Redirect to search page with the query
            window.location.href = `/search?query=${encodeURIComponent(query)}`;
        }
    });
});
