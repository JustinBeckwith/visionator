FROM gcr.io/google_appengine/nodejs
COPY . /app/
RUN yarn install
CMD npm start
