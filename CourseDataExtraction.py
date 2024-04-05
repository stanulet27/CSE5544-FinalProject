#---------------------------------------------------------------------------------------------
# Title: Course Data Extraction
# Description: Using web scraping, the following code extracts all details of OSU CSE Syllabi
# Author: S. Ibaven
#----------------------------------------------------------------------------------------------

import requests
import json
from bs4 import BeautifulSoup

URL = "https://cse.osu.edu/courses"
page = requests.get(URL)
soup = BeautifulSoup(page.content,"html.parser")

allCourseList = []

#By analyzing the website html, 155 courses are listed
# Iterate through all of them to extract details

for i in range(156):
    results = soup.find(id="accordion-region-id-" + str(i))
    #Create dictionary structure
    courseDetails = {
    "Number" : "N/A",
    "Title" : "N/A",
    "Units" : "N/A",
    "Prereq" : "N/A",
    "Type" : "N/A"
    }
    #Add course title
    courseDetails["Title"] = results.find("span",class_="title").text

    #Extract course number without parenthesis
    courseDetails["Number"] = results.find("span", class_="number").text[1:-1]
    
    #To find units and prereq, it is necessary to do some text operations
    description = str(results.find("p", class_="description"))
    
    #Extracting Units
    courseDetails["Units"] = description[description.find("Units:")+14:len(description)-4]

    #Extracting Prereqs
    if "Prereq:" in description:
        prereq = description[description.find("Prereq:"):description.find("<span",description.find("Prereq:"))-1]
        courseDetails["Prereq"]  = prereq[prereq.find(":")+2:]
        
    #Append course details to all courses list
    allCourseList.append(courseDetails)


# Write all contents to Json file
with open("CSE_Courses.json", "w") as outfile:
    outfile.write("[")
    for i,course in enumerate(allCourseList):
        json.dump(course, outfile,indent=4,separators=(',',":"))
        if(i<len(allCourseList)-1):
            outfile.write(",")
    outfile.write("]")