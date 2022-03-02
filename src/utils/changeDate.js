import dayjs from "dayjs"

export default function changeDate(array, objectKey) {

  const newArr = array.map(el => { return { ...el, [objectKey]: dayjs(el[objectKey]).format('YYYY-MM-DD') } })

  return newArr

}