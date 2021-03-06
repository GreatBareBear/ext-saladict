import search, { LearnersDictResultLex, LearnersDictResultRelated } from '@/components/dictionaries/learnersdict/engine'
import { appConfigFactory, AppConfigMutable } from '@/app-config'
import fs from 'fs'
import path from 'path'

describe('Dict/LearnersDict/engine', () => {
  beforeAll(() => {
    const response = {
      house: fs.readFileSync(path.join(__dirname, 'response/house.html'), 'utf8'),
      door: fs.readFileSync(path.join(__dirname, 'response/door.html'), 'utf8'),
      jumblish: fs.readFileSync(path.join(__dirname, 'response/jumblish.html'), 'utf8'),
    }

    window.fetch = jest.fn((url: string) => {
      const key = Object.keys(response).find(keyword => url.endsWith(keyword))
      if (key) {
        return Promise.resolve({
          text: () => response[key]
        })
      }
      return Promise.reject(new Error(`Missing Response file for ${url}`))
    })
  })

  it('should parse lex result correctly', () => {
    return search('house', appConfigFactory())
      .then(searchResult => {
        expect(searchResult.audio && typeof searchResult.audio.us).toBe('string')

        const result = searchResult.result as LearnersDictResultLex
        expect(result.type).toBe('lex')
        expect(result.items).toHaveLength(2)

        expect(typeof result.items[0].title).toBe('string')
        expect(result.items[0].title).toBeTruthy()

        expect(typeof result.items[0].pron).toBe('string')
        expect(result.items[0].pron).toBeTruthy()

        expect(typeof result.items[0].infs).toBe('string')
        expect(result.items[0].infs).toBeTruthy()

        expect(typeof result.items[0].infsPron).toBe('string')
        expect(result.items[0].infsPron).toBeTruthy()

        expect(result.items[0].labels).toBeFalsy()

        expect(typeof result.items[0].senses).toBe('string')
        expect(result.items[0].senses).toBeTruthy()

        expect(result.items[0].arts).toHaveLength(1)

        expect(typeof result.items[0].phrases).toBe('string')
        expect(result.items[0].phrases).toBeTruthy()

        expect(typeof result.items[0].derived).toBe('string')
        expect(result.items[0].derived).toBeTruthy()

        // 2
        expect(typeof result.items[1].title).toBe('string')
        expect(result.items[1].title).toBeTruthy()

        expect(typeof result.items[1].pron).toBe('string')
        expect(result.items[1].pron).toBeTruthy()

        expect(typeof result.items[1].infs).toBe('string')
        expect(result.items[1].infs).toBeTruthy()

        expect(result.items[1].infsPron).toBeFalsy()

        expect(typeof result.items[1].labels).toBe('string')
        expect(result.items[1].labels).toBeTruthy()

        expect(typeof result.items[1].senses).toBe('string')
        expect(result.items[1].senses).toBeTruthy()

        expect(result.items[1].arts).toHaveLength(0)

        expect(result.items[1].phrases).toBeFalsy()

        expect(result.items[1].derived).toBeFalsy()
      })
  })

  it('should parse related result correctly', () => {
    return search('jumblish', appConfigFactory())
      .then(searchResult => {
        expect(searchResult.audio).toBeUndefined()

        const result = searchResult.result as LearnersDictResultRelated
        expect(result.type).toBe('related')
        expect(typeof result.list).toBe('string')
      })
  })
})
