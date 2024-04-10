function returnBaseCourses(courseSet, selectionOptions){
    //return the base courses for the given course set
    let baseCourses = new Set();
    for(let course of courseSet){
        if(!selectionOptions.includes(course.Number)){
            baseCourses.add(course);
        }
    }
    return baseCourses;
}

function returnSelectedCourses(courseSet, selections){
    //using core courses and selections build a set excluding non selected courses
    let selectedCourses = new Set();
    for(let course of courseSet){
        if(selections.includes(course.Number)){
            selectedCourses.add(course);
        }
    }
    return selectedCourses;
}

export {returnBaseCourses,returnSelectedCourses};

