import * as Puppeteer from 'puppeteer'

(async() => {
    //instantiate browser/pages
    const browser = await Puppeteer.launch()
    const page = await browser.newPage()
    
    //load link (URL editable to any AOPS AMC10 Problem)
    await page.goto('https://artofproblemsolving.com/wiki/index.php/2019_AMC_10A_Problems/Problem_13')

    //wait for selector to load
    await page.waitForSelector('#mw-content-text')

    //get the index of the things that need to be screenshotted (Note: Puppeteer dosen't allow for accessing nodes and nonserial data anywhere but the page, so we have to return serializable data, like the position of the things we need)
    const query = await page.$eval('#mw-content-text', (el)=> {
        //get the holder of the questions and answers
        const child = el.firstChild

        //get all questions and answers
        const childData = child?.childNodes

        //dont worry bout the ":ChildNodes[]", thats just defining type for TS
        const nodes: ChildNode[] = []
        
        //convert the nodeList to array, because you have to do that for some reason to use es6 array things
        childData?.forEach(child=> {
            nodes.push(child)
        })

        //map nodes to nodenames to make them easier to work with
        const nodeNames = nodes.map(node=>node.nodeName)

        //get the index of the first and second H2 (the "problem" div and the solution div)
        const firstIndex = nodeNames.indexOf('H2')
        nodeNames.splice(firstIndex, 1)
        //the -1 is important because we need to shift down a notch (due to the array.slice() we did)
        const nextIndex = nodeNames.indexOf('H2') - 1

        //find all nodes between the index's we just found, and return them
        const neededNodes: number[] = []
        for(let i=nextIndex ; i>firstIndex; i--){
            neededNodes.push(i)
        }
        return neededNodes
    })
    //screenshot the full page
    await page.screenshot({path: './images/screenshot.png'})

    //for each of the index's we found, generate a selector for it, and then take a screenshot
    for (let i of query){
        const elHandle = await page.$(`#mw-content-text > div > p:nth-child(${i})`)
        await elHandle?.screenshot({path: `./images/${i}.png`, type: 'png'})
    }
    browser.close()
})()