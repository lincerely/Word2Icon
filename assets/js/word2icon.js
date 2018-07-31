/**
 * Word2Icon 
 * 
 * @description scrape name of icons and match with the inputs
 * @function init - init the class, input will be disable until done
 */
var Word2Icon = (function () {

    const ICON_LIST_SRC = "https://raw.githubusercontent.com/google/material-design-icons/master/iconfont/codepoints";
    const NUM_TO_SHOW = 5;

    var iconNameList = [];
    var iconWordList = [];
    var searchInput = undefined;

    function init() {
        searchInput = $s('#search-input')

        //disable button until done
        searchInput.disabled = true;

        // download list of icon
        GetIconList()

        searchInput.addEventListener('input', search);
    }

    function search() {
        var word = searchInput.value.toLowerCase();

        if (word.length === 0){
            searchInput.classList.remove('valid')
            searchInput.classList.remove('invalid')
            $s('#response').innerHTML = '';
            return;
        }

        var simWords = Word2VecUtils.getSortListSim(NUM_TO_SHOW, word, iconWordList);
        
        if (simWords[0] === false) {
            searchInput.classList.add('invalid')
            searchInput.classList.remove('valid')
            $s('#response').innerHTML = 'No vector for that word. Try another.';
        } else {
            searchInput.classList.remove('invalid')
            searchInput.classList.add('valid')
            renderSimilarities('#sim-table', simWords);
        }
    }

    function GetIconList() {
        var client = new XMLHttpRequest();
        client.open('GET', ICON_LIST_SRC);
        client.onloadend = function () {
            iconNameList = client.responseText.split('\n').map(function (val) {
                return val.split(' ')[0]
            })
            iconWordList = iconNameList.join("_").split("_")
            searchInput.disabled = false;

            console.log(iconNameList)
            search();
        }
        client.onerror = function (ev) {
            alert(ev.error);
        }
        client.send();
    }

    // TODO: [function] short 2 long wb => white balance

    /********************
    * helper functions */
    function $s(id) { //for convenience
        if (id.charAt(0) !== '#') return false;
        return document.getElementById(id.substring(1));
    }

    function renderSimilarities(id, sims) {
        let matchNames = []


        //find matched names
        iconNameList.forEach(function (iconName) {
            for (var i in sims) {
                if (iconName.split('_').includes(sims[i][0])) {
                    matchNames.push([iconName, sims[i][0], sims[i][1]]);
                    continue
                }
            }
        })

        matchNames.sort(function (a, b) { return b[2] - a[2]; })

        $s(id).innerHTML = '';
        matchNames.forEach(function (name) {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td><i class="material-icons">' + name[0] + '</i></td>';
            tr.innerHTML += '<td>' + name[0] + '</td>';
            tr.innerHTML += '<td>' + name[1] + '</td>';
            tr.innerHTML += '<td>' + name[2] + '</td>';
            $s(id).appendChild(tr);
        });
        $s('#response').innerHTML = "Total " + matchNames.length + " matches.";

    }

    return {
        init: init
    }
})();


window.addEventListener('load', Word2Icon.init);