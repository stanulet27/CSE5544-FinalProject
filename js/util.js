import {renderChoices,returnSelectedChoices} from './SelectionArea.js';

function returnBaseCourses(courseSet, selectionOptions)
{
    //return the base courses for the given course set
    let baseCourses = new Set();
    for(let course of courseSet){
        if(!selectionOptions.includes(course.Number)){
            baseCourses.add(course);
        }
    }
    return baseCourses;
}

function returnSelectedCourses(courseSet, selections)
{
    //using core courses and selections build a set excluding non selected courses
    let selectedCourses = new Set();
    for(let course of courseSet){
        if(selections.includes(course.Number)){
            selectedCourses.add(course);
        }
    }
    return selectedCourses;
}

function containsValue(arr,v)
{
    var found = false;

    arr.forEach(arrV => 
    {
        
        if(arrV.Number == v)
        {
            found = true;
        }

    })

    return found;
}
async function interactionHandler()
{
    //Load Json files
    var specializationsData = await d3.json("data/CSE_Courses_Specialization.json");
    var selectionOptions = await d3.json("data/Choice_Options.json");
    var coreClassesData = await d3.json("data/CSE_Courses_Core_Updated.json");

    //Get selectionOptions unique IDs array
    var selectionOptionsUniqueNumbers = [];
    selectionOptions.forEach(option => {
        option.Choices.forEach(courseNumber =>
        {
            if(!selectionOptionsUniqueNumbers.includes(courseNumber.id))
            {
                selectionOptionsUniqueNumbers.push(courseNumber.id);
            }

        })
    });

    //Array to include al courses we want to render
    var allCoursesToRender = [];
    
    //------------------------------------------------------ DROPDOWN INTERACTION -------------------------------------------------------------------------
    if(this.getAttribute("class") == "dropdown-menu")
    {
        clearGraph();
        clearSelectionArea();

        //console.log("Interaction at the dropdown menu");
        var selectedSpecialization = this.value;

        if(selectedSpecialization != "None")
        {
            //We render choices only when we selected a specialization 
            renderChoices(selectedSpecialization, selectionOptions, document.getElementById("selection_area"));

            var checkboxes = document.querySelectorAll("input[type=checkbox]");
            checkboxes.forEach(function(checkbox) 
            {
                checkbox.addEventListener('change', interactionHandler);
            });

            //---------------------------------------------- ALL COURSES ARRAY CREATION --------------------------------------------------
            
            //Now that we know which specialization was selected we can add specialization courses that are required (options are not included in this step), to the ALL COURSES ARRAY
            specializationsData.forEach(element => 
            {
                // Append only the required courses from the specialization
                if(element.Specialization == selectedSpecialization && element.Type == "REQUIRED")
                {
                    allCoursesToRender.push(element)
                }  
            });

            //Now we iterate on the specialization courses to add details of their prereqs, we add them to the ALL COURSES ARRAY
            allCoursesToRender.forEach(element => 
            {
                //Find the "AND" prereq information
                var andPrereqs = element.Prereq.split(";");
                andPrereqs.forEach(andPrereq => 
                {
                    if(!andPrereq.includes(",")) // Exclude all OR prereqs
                    {
                        // We look if the prereq is already on ALL COURSES ARRAY
                        // If it is not, we get the details from the CORE courses, then we append it.
                        if(!allCoursesToRender.includes(andPrereq))
                        {
                            //Get the details from CORE courses
                            coreClassesData.forEach( coreClass => 
                            {
                                if(coreClass.Number == andPrereq)
                                {
                                    allCoursesToRender.push(coreClass);
                                }
                            })   
                        }   
                    }
                })
            });
            
            //Now we go through all the CORE classes and add them to the array, if they were already added, we don't include them.
            coreClassesData.forEach(coreClass => 
            {
                //Check if they are already on the array
                if(!allCoursesToRender.includes(coreClass.Number))
                {
                    //We also need to check they are not from the selection area
                    if(!selectionOptionsUniqueNumbers.includes(coreClass.Number))
                    {
                        allCoursesToRender.push(coreClass);
                    }
                }   
            })

            //---------------------------------------------- DAG Creation --------------------------------------------------
            updateGraph(allCoursesToRender);
        }
    }
    else//----------------------------------------------------------------------- CHECKBOX INTERACTION ---------------------------------------------------------------------
    {
        clearGraph();

        var checkboxes = document.querySelectorAll("input[type=checkbox]");
        var selectedClasses = Array.from(checkboxes).filter(i => i.checked).map(i => i.value);
        //console.log(selectedClasses);

        //First lets find the course details for each course
        var coursesToAdd = [];

        selectedClasses.forEach((selectedClass,i) => 
        {
            specializationsData.forEach(element => 
            {
                // Append only the required courses from the specialization
                if(element.Number == selectedClass && document.getElementById("specializations").value == element.Specialization)
                {
                    coursesToAdd.push(element);
                }  
            });

            coreClassesData.forEach(coreClass => 
            {
                if(coreClass.Number == selectedClass)
                {
                    coursesToAdd.push(coreClass);
                }  
            })
            
        })

        //---------------------------------------------- ALL COURSES ARRAY CREATION --------------------------------------------------
        
        //Now that we know which specialization was selected we can add specialization courses that are required (options are not included in this step), to the ALL COURSES ARRAY
        specializationsData.forEach(element => 
        {
            // Append only the required courses from the specialization
            if(element.Specialization == document.getElementById("specializations").value && element.Type == "REQUIRED")
            {
                allCoursesToRender.push(element)
            }  
        });

        //Now we iterate on the specialization courses to add details of their prereqs, we add them to the ALL COURSES ARRAY
        allCoursesToRender.forEach(element => 
        {
            //Find the "AND" prereq information
            var andPrereqs = element.Prereq.split(";");
            andPrereqs.forEach(andPrereq => 
            {
                if(!andPrereq.includes(",")) // Exclude all OR prereqs
                {
                    // We look if the prereq is already on ALL COURSES ARRAY
                    // If it is not, we get the details from the CORE courses, then we append it.
                    if(!allCoursesToRender.includes(andPrereq))
                    {
                        //Get the details from CORE courses
                        coreClassesData.forEach( coreClass => 
                        {
                            if(coreClass.Number == andPrereq)
                            {
                                allCoursesToRender.push(coreClass);
                            }
                        })   
                    }   
                }
            })
        });
        
        //Now we go through all the CORE classes and add them to the array, if they were already added, we don't include them.
        coreClassesData.forEach(coreClass => 
        {
            //Check if they are already on the array
            if(!allCoursesToRender.includes(coreClass.Number))
            {
                //We also need to check they are not from the selection area
                if(!selectionOptionsUniqueNumbers.includes(coreClass.Number))
                {
                    allCoursesToRender.push(coreClass);
                }
            }   
        })

        //Understand if we need to add or remove nodes
        coursesToAdd.forEach(course => 
        {
            if(!containsValue(allCoursesToRender,course.Number))
            {
                allCoursesToRender.push(course);
            }
        })

        //---------------------------------------------- DAG Creation --------------------------------------------------
        updateGraph(allCoursesToRender);
    }

}

function clearGraph()
{
    // Clear graph and choice options each time the selection changed
    d3.select("#course-graph").select("g").remove();
}

function clearSelectionArea()
{
    d3.selectAll("#selection_area").html("");
}

function updateGraph(coursesInformation)
{
    // Create the renderer for graph
    var render = new dagreD3.render();

    //Create graph
    var g = new dagreD3.graphlib.Graph({directed:true})
                                .setGraph({rankdir:"lr"})
                                .setDefaultEdgeLabel(function() { return {}; });

    //Select the svg where the graph will be drawn
    const svgCourseGraph = d3.select("#course-graph");

    //Iterate through all the courses to set edges and nodes
    // ---------------------------------------------------------------------- NODES --------------------------------------------------------------------------
    coursesInformation.forEach(course => 
    {
        
        if(course.Type == "REQUIRED" || course.Type == "OPTION")
        {
            g.setNode(course.Number,{label : course.Number + ": " + course.Title, style: 'fill: green; text-align: center',id:course.Number});
        }
        else
        {
            g.setNode(course.Number,{label : course.Number + ": " + course.Title, style: 'fill: blue; text-align: center',id:course.Number});
        }

    });

    //------------------------------------------------------------------------ EDGES --------------------------------------------------------------------------
    coursesInformation.forEach(course => 
    {
        //console.log(course);
        //g.setEdge(andPrereq,course.Number,{id : "edge" + andPrereq + "-" + course.Number});
        
        //Find the "AND" prereq information
        //console.log(course.Prereq);
        var andPrereqs = course.Prereq.split(";");
        andPrereqs.forEach(andPrereq => 
        {
            if(!andPrereq.includes(",") && andPrereq != "NA") // Exclude all OR prereqs
            {
                if(g.hasNode(andPrereq))
                {
                    g.setEdge(andPrereq,course.Number,{id : "edge" + andPrereq + "-" + course.Number, curve: d3.curveBasis });
                }
            }
            else if(andPrereq.includes(",") && andPrereq != "NA")
            {
                var orPrereqs = andPrereq.split(",");
                console.log(orPrereqs);

                orPrereqs.forEach(orPrereq => 
                {
                    if(g.hasNode(orPrereq))
                    {
                        console.log(orPrereq + "-" + course.Number );
                        g.setEdge(orPrereq,course.Number,{id : "edge" + orPrereq + "-" + course.Number, curve: d3.curveBasis, style: "stroke-dasharray: 5, 5; fill-opacity: 0" });
                    }
                })

            }
        })
    })

    //Graphic adjustment of nodes
    g.nodes().forEach(function(v) 
    {
        var node = g.node(v);
        // Round the corners of the nodes
        node.rx = node.ry = 5;
    });

    // Set up an SVG group so that we can translate the final graph.
    svgCourseGraph.append("g");

    // Run the renderer. This is what draws the final graph.
    render(svgCourseGraph.select("g"), g);

    // Center the graph
    var initialScale = 1;
    var xCenterOffset = (window.innerWidth - g.graph().width) / 2;
    svgCourseGraph.select("g").attr("transform", "translate(" + 3 + ", 20)");
    //svgCourseGraph.select("g").attr("transform", "translate(" + 0 + ", 20)");
    svgCourseGraph.attr("height", g.graph().height * initialScale + 40);

    // --------------------------------------------- ZOOM ------------------------------------------------------------
    d3.select("#course-graph").attr("viewBox", "0 0 "+ g.graph().width + " " + g.graph().height);

    // ----------------------------------------- MOUSE INTERACTION ---------------------------------------------------
    // Adding mouse click to tspan, since it is the biggest surface on the nodes
    d3.selectAll(".node").on("mouseenter",function()
    {
        var nodeId = d3.select(this).property("id");
        var allNodeEdges = g.nodeEdges(nodeId);

        allNodeEdges.forEach(edge => 
        {
            //console.log(edge.v);
            var edgeId = "edge"+ edge.v + "-" + edge.w;
            //console.log(edgeId);
            d3.selectAll("#" + edgeId).selectAll("path").style("stroke","red").style("stroke-width","3");
            d3.selectAll("#" + edgeId).selectAll("defs").selectAll("marker").selectAll("path").style("fill","red");
        })

    })
    .on("mouseleave", function()
    {
        var nodeId = d3.select(this).property("id");
        var allNodeEdges = g.nodeEdges(nodeId);

        allNodeEdges.forEach(edge => 
        {
            //console.log(edge.v);
            var edgeId = "edge"+ edge.v + "-" + edge.w;
            //console.log(edgeId);
            d3.selectAll("#" + edgeId).selectAll("path").style("stroke","black").style("stroke-width","1");;
            d3.selectAll("#" + edgeId).selectAll("defs").selectAll("marker").selectAll("path").style("fill","black");

        })

    })
    //-----------------------------------------------------------------------------------------------------------------

}



export {returnBaseCourses,returnSelectedCourses,interactionHandler};

