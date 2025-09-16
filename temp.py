import requests

def get_og_link(earnkaro_url):
    try:
        # Make request but follow redirects
        response = requests.get(earnkaro_url, allow_redirects=True, timeout=10)
        return response.url
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    ek_url = input("Enter EarnKaro link: ")
    og_link = get_og_link(ek_url)
    print("OG Link:", og_link)
