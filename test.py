import requests

# Define the URL to fetch HTML from
url = "https://www.livesoccertv.com/channels/starplus-sur/"

# Make a GET request to the URL
response = requests.get(url)

# Print the HTML content to stdout
print(response.text)
