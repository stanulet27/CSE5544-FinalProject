function renderChoices(choiceOptions, htmlElement){
    choiceOptions.forEach(element => {
        htmlElement.innerHTML += `<p>Please select ${element.Number}</p><div class="choice" id="${element.Selection}">`;
        element.Choices.forEach(choice => {
            document.getElementById(element.Selection).innerHTML += `<label class="option"><input type="checkbox" name="${element.Selection} id="${choice.id}" value="${choice.id}"/>${choice.id}</label>`;
        });
        htmlElement.innerHTML += `</div>`;
    });
}

function returnSelectedChoices(core, specialization, selections){
    console.log("AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH")
    let selectedChoices = new Set();
    for(let course of core){
        if(selections.includes(course.Number)){
            if(!selectedChoices.has(course.Number)){
                selectedChoices.add({[course.Number]:course});
            }
        }
    }
    for(let course of specialization){
        if(selections.includes(course.Number)){
            if(!selectedChoices.has(course.Number)){
                selectedChoices.add({[course.Number]:course});
            }
        }
    }
    return Array.from(selectedChoices);
}
export {renderChoices, returnSelectedChoices};