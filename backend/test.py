import urllib.request
import re
import json

video_id = "ATawgx_kALA"
url = "https://www.youtube.com/watch?v=" + video_id
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')

match = re.search(r'ytInitialPlayerResponse\s*=\s*(\{.+?\});', html)
if not match:
    print("ytInitialPlayerResponse not found")
    exit(1)

data = json.loads(match.group(1))
tracks = data['captions']['playerCaptionsTracklistRenderer']['captionTracks']
base_url = tracks[0]['baseUrl']

target = base_url + "&fmt=json3"
print("DL:", target)
res = urllib.request.urlopen(urllib.request.Request(target, headers={'User-Agent': 'Mozilla/5.0'}))
print(res.read().decode('utf-8')[:200])
