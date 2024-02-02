# Create Github App Token (with commit user)

## This repository is now developing.


## Input
* `app-id`: Github App ID
* `private-key`: Github App Private Key

## Output
* `token`: Github App Access Token
* `commit_name`: Github App Bot commit User name
* `commit_address`: Github App Bot commit User email

### Uses
```
on:
  push:


jobs:
   tagging:
       runs-on: ubuntu-latest
       name: Update Major Tags
       steps:
          - name: Generate Token
            uses: atolycs/action-app-auth@master
            id: generate-token
            with:
              appID: ${{ secrets.APP_ID }}
              privateKey: ${{ secrets.APP_PEM }}

          - name: checkout
            uses: actions/checkout@v4

          - name: Git setup
            run: |
              git config --global user.name ${{ steps.generate-token.outputs.commit_name }}
              git config --global user.email ${{ steps.generate-token.outputs.commit_address }}
            ...         
```


[actions/create-github-app-token](https://github.com/actions/create-github-app-token)