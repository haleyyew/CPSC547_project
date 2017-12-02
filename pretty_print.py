import json
import os

parent_dir = os.getcwd()

filename = os.path.join(parent_dir, ("output.json"))
data = json.load(open(filename))

with open(os.path.join(parent_dir, "output_pretty.json"), 'w') as outfile:
	outfile.write(json.dumps(data, indent=4, sort_keys=True))
