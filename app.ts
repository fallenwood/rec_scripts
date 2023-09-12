// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://rec.ustc.edu.cn/group/*/disk
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ustc.edu.cn
// @grant        none
// ==/UserScript==

interface RecNode {
    name: string;
    fullName: string;
    number: string;
    url: string;
    type: string;
    children: RecNode[];
}

const homeUrlTemplate = `https://recapi.ustc.edu.cn/api/v2/folder/content/0?disk_type=cloud&group_number=<group>&is_rec=false&category=all&offset=0`;

const folderUrlTemplate = `https://recapi.ustc.edu.cn/api/v2/folder/content/<number>?disk_type=cloud&group_number=<group>&is_rec=false&category=all`;

(function() {
    'use strict';

    const tree = {} as RecNode;
    const group = window.location.href.split('/')[4];

    const getTree = async (root: RecNode, url: string, group: string): Promise<any> => {
        const response = await fetch(url);
        const json = await response.json();

        console.log(url, json);

        const datas = json["entity"]["datas"];
        let promises = [] as Promise<any>[];

        for (const data of datas) {
            const node: RecNode = {
                name: data["name"],
                fullName: data["name"],
                number: data["number"],
                children: [],
                url: "",
                type: data["type"],
            };

            root.children.push(node);

            if (node.type === "folder") {
                node.url = folderUrlTemplate.replace('<number>', node.number).replace('<group>', group);
                promises.push(getTree(node, node.url, group));
            }
        }

        await Promise.all(promises);
    };

    const initialize = async (tree: RecNode, group: string) => {
        const homeUrl = homeUrlTemplate.replace('<group>', group);
        
        await getTree(tree, homeUrl, group);
    }

    initialize(tree, group)
    .then(() => {
        console.log(tree);
    }).catch((err) => { 
        console.error(err);
    });
})();