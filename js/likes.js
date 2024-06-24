/*************************************************
 * Not Refactered
 * this is not the part of chat page
 **************************************************/

const handelLikes = async (likes) => {
    document.addEventListener('DOMContentLoaded', function () {
        const tagInputField = document.querySelector('.tag-input-field');
        const tagsList = document.querySelector('.tags-list');
        if(!tagInputField || !tagsList){
            console.log("No tag input field found");
            return ;
        }
        tagInputField.addEventListener('keydown', function (event) {
            const tagText = event.target.value.trim();

            if (event.key === 'Enter' && tagText !== '') {
                if (!likes.includes(tagText)) {
                    const tag = document.createElement('div');
                    tag.className = 'tag';
                    tag.innerHTML = `
                        <span>${tagText}</span>
                        <span class="tag-close-btn">&times;</span>
                    `;      
                    likes.push(tagText);
                    tagsList.appendChild(tag);
                    event.target.value = '';
                }else{
                    alert("already exists");
                }
            }
        });

        tagsList.addEventListener('click', function(event) {
            if (event.target.classList.contains('tag-close-btn')) {
              const tagText = event.target.previousElementSibling.textContent.trim();
              const index = likes.indexOf(tagText);
              if (index !== -1) {
                likes.splice(index, 1);
              }
              event.target.parentElement.remove();
            }
          });
    });
}
export default handelLikes;