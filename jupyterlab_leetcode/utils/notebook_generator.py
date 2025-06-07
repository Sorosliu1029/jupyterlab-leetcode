import json
import os
import re
import sys

from .utils import first


def get_folder_for(qid: int, interval: int) -> str:
    interval_start = (qid - 1) // interval * interval + 1
    return f"{interval_start}-{interval_start + interval - 1}"


class NotebookGenerator:
    def __init__(self):
        template_path = os.path.join(
            os.path.dirname(os.path.realpath(__file__)),
            "notebook.template.json",
        )

        with open(template_path, "rt") as f:
            self.template = json.load(f)

    def __populate_metadata(self, q):
        self.template["metadata"]["language_info"]["version"] = "{}.{}.{}".format(
            *sys.version_info[:3]
        )

        metadata_question_info = self.template["metadata"]["leetcode_question_info"]
        metadata_question_info["submitUrl"] = q["submitUrl"]
        metadata_question_info["sampleTestCase"] = q["sampleTestCase"]
        metadata_question_info["questionId"] = q["questionId"]
        metadata_question_info["questionFrontendId"] = q["questionFrontendId"]
        metadata_question_info["questionDetailUrl"] = q["questionDetailUrl"]

    def __populate_title(self, q):
        title_cell = first(
            self.template["cells"], lambda c: c["metadata"]["id"] == "title"
        )
        if not title_cell:
            return

        title_cell["source"] = [f"### {q["questionFrontendId"]}. {q["title"]}"]

    def __populate_content(self, q):
        content_cell = first(
            self.template["cells"], lambda c: c["metadata"]["id"] == "content"
        )
        if not content_cell:
            return

        content_cell["source"] = [q["content"]]

    def __populate_extra(self, q):
        extra_cell = first(
            self.template["cells"], lambda c: c["metadata"]["id"] == "extra"
        )
        if not extra_cell:
            return

        extra_cell["source"] = [
            f"#### Difficulty: {q["difficulty"]}, AC rate: {json.loads(q["stats"])["acRate"]}\n\n",
            "#### Topics:\n",
            f"{' | '.join((t["name"] for t in q["topicTags"]))}\n\n",
            "#### Links:\n",
            f" 🎁 [Question Detail](https://leetcode.com{q["questionDetailUrl"]}description/)"
            + f" | 🎉 [Question Solution](https://leetcode.com{q["questionDetailUrl"]}solution/)"
            + f" | 💬 [Question Discussion](https://leetcode.com{q["questionDetailUrl"]}discuss/?orderBy=most_votes)\n\n",
        ]

        if q["hints"]:
            extra_cell["source"].append("#### Hints:\n")
            extra_cell["source"].extend(
                [
                    f"<details><summary>Hint {idx}  🔍</summary>{hint}</details>\n"
                    for idx, hint in enumerate(q["hints"])
                ]
            )

    def __populate_test(self, q):
        test_cell = first(
            self.template["cells"], lambda c: c["metadata"]["id"] == "test"
        )
        if not test_cell:
            return

        test_cell["source"] = ["#### Sample Test Case\n", q["sampleTestCase"]]

    def __populate_code(self, q):
        code_cell = first(
            self.template["cells"], lambda c: c["metadata"]["id"] == "code"
        )
        if not code_cell:
            return

        code_snippet = first(q["codeSnippets"], lambda cs: cs["langSlug"] == "python3")
        if not code_snippet:
            return

        snippet = code_snippet["code"]
        pre_solution_index = snippet.find("class Solution:")
        pre_solution = None
        if pre_solution_index > 0:
            pre_solution = snippet[:pre_solution_index]
            snippet = snippet[pre_solution_index:]
        code_cell["source"] = [snippet + "pass"]
        code_cell["metadata"]["isSolutionCode"] = True

        if pre_solution:
            code_cell_index = first(
                enumerate(self.template["cells"]),
                lambda ic: ic[1]["metadata"]["id"] == "code",
            )
            if code_cell_index is not None:
                self.template["cells"].insert(
                    code_cell_index[0],
                    {
                        "cell_type": "code",
                        "execution_count": None,
                        "metadata": {"id": "pre_code"},
                        "outputs": [],
                        "source": [pre_solution.strip(" \n")],
                    },
                )

        return snippet

    def __populate_run(self, snippet):
        run_cell = first(self.template["cells"], lambda c: c["metadata"]["id"] == "run")
        if not run_cell:
            return

        func_match = re.search(r"class Solution:\s+def (.*?)\(self,", snippet)
        if not func_match:
            return

        func_name = func_match[1]
        run_cell["source"] = [f"Solution().{func_name}()"]

    def __dump(self, q, base_dir="."):
        qid = q["questionFrontendId"]
        directory = os.path.join(base_dir, get_folder_for(int(qid), 50))
        if not os.path.exists(directory):
            os.mkdir(directory)

        file_path = os.path.join(directory, f"{qid}.{q["titleSlug"]}.ipynb")
        with open(file_path, "w+") as f:
            json.dump(self.template, f, indent=2)

        return file_path

    def generate(self, q):
        self.__populate_metadata(q)
        self.__populate_title(q)
        self.__populate_content(q)
        self.__populate_extra(q)
        self.__populate_test(q)
        snippet = self.__populate_code(q)
        self.__populate_run(snippet)
        file_path = self.__dump(q)
        return file_path
